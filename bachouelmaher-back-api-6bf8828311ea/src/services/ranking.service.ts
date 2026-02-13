// src/services/ranking.service.ts
import { AppDataSource } from "@/orm/data-source";
import { UserEntity } from "@/orm/entities/user.entity";
import { EnrollCourseEntity } from "@/orm/entities/enroll-course.entity";

const userRepository = AppDataSource.getRepository(UserEntity);
const enrollCourseRepository = AppDataSource.getRepository(EnrollCourseEntity);

export const getUserRankingByRole = async (userId: string) => {
  try {
    // 1. Récupérer l'utilisateur courant pour connaître son rôle
    const currentUser = await userRepository.findOne({
      where: { id: userId },
      relations: ['key', 'key.pharmacy']
    });

    if (!currentUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // 2. Récupérer tous les utilisateurs avec le même rôle (actifs seulement)
    // Version corrigée pour MariaDB - sans NULLS LAST
    const usersWithSameRole = await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoin('key.pharmacy', 'pharmacy')
      .leftJoin('user.enrolls', 'enrolls')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.role AS role',
        'user.img_link AS img_link',
        'pharmacy.name AS pharmacyName'
      ])
      .addSelect("COUNT(CASE WHEN enrolls.status = 2 THEN 1 END)", "completedCourses")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.points ELSE 0 END), 0)", "totalPoints")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizPoints ELSE 0 END), 0)", "quizPoints")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 0)", "quizNumber")
      .addSelect(`
        CASE 
          WHEN COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 0) > 0 
          THEN ROUND(
            (COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizPoints ELSE 0 END), 0) / 
             COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 1)) * 100, 
            2
          )
          ELSE 0 
        END`, "averageScore")
      .where("user.role = :role", { role: currentUser.role })
      .andWhere("user.status = :status", { status: 1 }) // Seulement les utilisateurs actifs
      .groupBy('user.id, pharmacy.name')
      // Version corrigée pour MariaDB - utiliser COALESCE pour gérer les NULL
      .orderBy('COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.points ELSE 0 END), 0)', 'DESC')
      .addOrderBy('COUNT(CASE WHEN enrolls.status = 2 THEN 1 END)', 'DESC')
      .getRawMany();

    // 3. Calculer la position de l'utilisateur courant
    let currentUserRank = 0;
    const currentUserData = usersWithSameRole.find(user => user.id === userId);
    if (currentUserData) {
      currentUserRank = usersWithSameRole.findIndex(user => user.id === userId) + 1;
    }

    // 4. Préparer les statistiques de l'utilisateur courant
    const currentUserStats = currentUserData ? {
      totalPoints: parseFloat(currentUserData.totalPoints) || 0,
      quizPoints: parseFloat(currentUserData.quizPoints) || 0,
      quizNumber: parseFloat(currentUserData.quizNumber) || 0,
      completedCourses: parseInt(currentUserData.completedCourses) || 0,
      averageScore: parseFloat(currentUserData.averageScore) || 0,
      pharmacyName: currentUserData.pharmacyName
    } : {
      totalPoints: 0,
      quizPoints: 0,
      quizNumber: 0,
      completedCourses: 0,
      averageScore: 0,
      pharmacyName: currentUser.key?.pharmacy?.name || 'Non spécifiée'
    };

    // 5. Formater les données pour le frontend
    const formattedRanking = usersWithSameRole.map((user, index) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      img_link: user.img_link,
      pharmacyName: user.pharmacyName || 'Non spécifiée',
      totalPoints: parseFloat(user.totalPoints) || 0,
      quizPoints: parseFloat(user.quizPoints) || 0,
      quizNumber: parseFloat(user.quizNumber) || 0,
      completedCourses: parseInt(user.completedCourses) || 0,
      averageScore: parseFloat(user.averageScore) || 0,
      position: index + 1,
      isCurrentUser: user.id === userId
    }));

    return {
      ranking: formattedRanking,
      userPosition: currentUserRank,
      totalUsers: usersWithSameRole.length,
      userStats: currentUserStats
    };
  } catch (error) {
    console.error('Error in getUserRankingByRole:', error);
    throw error;
  }
};

export const getUserRankingByPharmacy = async (userId: string) => {
  try {
    // 1. Récupérer l'utilisateur courant pour connaître sa pharmacie
    const currentUser = await userRepository.findOne({
      where: { id: userId },
      relations: ['key', 'key.pharmacy']
    });

    if (!currentUser || !currentUser.key || !currentUser.key.pharmacy) {
      throw new Error('Utilisateur ou pharmacie non trouvé');
    }

    const pharmacyId = currentUser.key.pharmacy.id;

    // 2. Récupérer tous les utilisateurs de la même pharmacie
    // Version corrigée pour MariaDB - sans NULLS LAST
    const usersInSamePharmacy = await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoin('key.pharmacy', 'pharmacy')
      .leftJoin('user.enrolls', 'enrolls')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.role AS role',
        'user.img_link AS img_link',
        'pharmacy.name AS pharmacyName'
      ])
      .addSelect("COUNT(CASE WHEN enrolls.status = 2 THEN 1 END)", "completedCourses")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.points ELSE 0 END), 0)", "totalPoints")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizPoints ELSE 0 END), 0)", "quizPoints")
      .addSelect("COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 0)", "quizNumber")
      .addSelect(`
        CASE 
          WHEN COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 0) > 0 
          THEN ROUND(
            (COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizPoints ELSE 0 END), 0) / 
             COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 1)) * 100, 
            2
          )
          ELSE 0 
        END`, "averageScore")
      .where("key.pharmacy = :pharmacyId", { pharmacyId })
      .andWhere("user.status = :status", { status: 1 })
      .groupBy('user.id, pharmacy.name')
      // Version corrigée pour MariaDB - utiliser COALESCE pour gérer les NULL
      .orderBy('COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.points ELSE 0 END), 0)', 'DESC')
      .addOrderBy('COUNT(CASE WHEN enrolls.status = 2 THEN 1 END)', 'DESC')
      .getRawMany();

    // 3. Calculer la position de l'utilisateur courant
    let currentUserRank = 0;
    const currentUserData = usersInSamePharmacy.find(user => user.id === userId);
    if (currentUserData) {
      currentUserRank = usersInSamePharmacy.findIndex(user => user.id === userId) + 1;
    }

    // 4. Préparer les statistiques de l'utilisateur courant
    const currentUserStats = currentUserData ? {
      totalPoints: parseFloat(currentUserData.totalPoints) || 0,
      quizPoints: parseFloat(currentUserData.quizPoints) || 0,
      quizNumber: parseFloat(currentUserData.quizNumber) || 0,
      completedCourses: parseInt(currentUserData.completedCourses) || 0,
      averageScore: parseFloat(currentUserData.averageScore) || 0,
      pharmacyName: currentUserData.pharmacyName
    } : {
      totalPoints: 0,
      quizPoints: 0,
      quizNumber: 0,
      completedCourses: 0,
      averageScore: 0,
      pharmacyName: currentUser.key.pharmacy.name
    };

    // 5. Formater les données pour le frontend
    const formattedRanking = usersInSamePharmacy.map((user, index) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      img_link: user.img_link,
      pharmacyName: user.pharmacyName,
      totalPoints: parseFloat(user.totalPoints) || 0,
      quizPoints: parseFloat(user.quizPoints) || 0,
      quizNumber: parseFloat(user.quizNumber) || 0,
      completedCourses: parseInt(user.completedCourses) || 0,
      averageScore: parseFloat(user.averageScore) || 0,
      position: index + 1,
      isCurrentUser: user.id === userId
    }));

    return {
      ranking: formattedRanking,
      userPosition: currentUserRank,
      totalUsers: usersInSamePharmacy.length,
      userStats: currentUserStats
    };
  } catch (error) {
    console.error('Error in getUserRankingByPharmacy:', error);
    throw error;
  }
};

export const getUserRankingStats = async (userId: string) => {
  try {
    const stats = await enrollCourseRepository
      .createQueryBuilder("enrolls")
      .leftJoin('enrolls.user', 'user')
      .select([
        'user.id AS userId',
        'COUNT(CASE WHEN enrolls.status = 2 THEN 1 END) AS completedCourses',
        'COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.points ELSE 0 END), 0) AS totalPoints',
        'COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizPoints ELSE 0 END), 0) AS quizPoints',
        'COALESCE(SUM(CASE WHEN enrolls.status = 2 THEN enrolls.quizNumber ELSE 0 END), 0) AS quizNumber'
      ])
      .where("user.id = :userId", { userId })
      .groupBy('user.id')
      .getRawOne();

    if (stats) {
      const completedCourses = parseInt(stats.completedCourses) || 0;
      const totalPoints = parseFloat(stats.totalPoints) || 0;
      const quizPoints = parseFloat(stats.quizPoints) || 0;
      const quizNumber = parseFloat(stats.quizNumber) || 0;
      const averageScore = quizNumber > 0 ? Math.round((quizPoints / quizNumber) * 100) : 0;
      
      return {
        userId,
        completedCourses,
        totalPoints,
        quizPoints,
        quizNumber,
        averageScore,
        totalTimeSpent: completedCourses * 45 // Estimation: 45 minutes par cours
      };
    }

    return {
      userId,
      completedCourses: 0,
      totalPoints: 0,
      quizPoints: 0,
      quizNumber: 0,
      averageScore: 0,
      totalTimeSpent: 0
    };
  } catch (error) {
    console.error('Error in getUserRankingStats:', error);
    throw error;
  }
};

// Version alternative avec sous-requête pour mieux gérer les cas NULL
export const getUserRankingByRoleAlternative = async (userId: string) => {
  try {
    const currentUser = await userRepository.findOne({
      where: { id: userId },
      relations: ['key', 'key.pharmacy']
    });

    if (!currentUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Utiliser une sous-requête pour calculer les statistiques
    const query = `
      SELECT 
        u.id AS id,
        u.email AS email,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.role AS role,
        u.img_link AS img_link,
        p.name AS pharmacyName,
        COALESCE(stats.completedCourses, 0) AS completedCourses,
        COALESCE(stats.totalPoints, 0) AS totalPoints,
        COALESCE(stats.quizPoints, 0) AS quizPoints,
        COALESCE(stats.quizNumber, 0) AS quizNumber,
        CASE 
          WHEN COALESCE(stats.quizNumber, 0) > 0 
          THEN ROUND((COALESCE(stats.quizPoints, 0) / COALESCE(stats.quizNumber, 1)) * 100, 2)
          ELSE 0 
        END AS averageScore
      FROM users u
      LEFT JOIN \`pharmacies-users\` pu ON pu.userId = u.id
      LEFT JOIN pharmacies p ON p.id = pu.pharmacyId
      LEFT JOIN (
        SELECT 
          userId,
          COUNT(CASE WHEN status = 2 THEN 1 END) AS completedCourses,
          SUM(CASE WHEN status = 2 THEN points ELSE 0 END) AS totalPoints,
          SUM(CASE WHEN status = 2 THEN quizPoints ELSE 0 END) AS quizPoints,
          SUM(CASE WHEN status = 2 THEN quizNumber ELSE 0 END) AS quizNumber
        FROM \`enroll-courses\`
        GROUP BY userId
      ) stats ON stats.userId = u.id
      WHERE u.role = ? AND u.status = 1
      ORDER BY COALESCE(stats.totalPoints, 0) DESC, COALESCE(stats.completedCourses, 0) DESC
    `;

    const usersWithSameRole = await userRepository.query(query, [currentUser.role]);

    // Le reste du code reste le même...
    let currentUserRank = 0;
    const currentUserData = usersWithSameRole.find(user => user.id === userId);
    if (currentUserData) {
      currentUserRank = usersWithSameRole.findIndex(user => user.id === userId) + 1;
    }

    const currentUserStats = currentUserData ? {
      totalPoints: parseFloat(currentUserData.totalPoints) || 0,
      quizPoints: parseFloat(currentUserData.quizPoints) || 0,
      quizNumber: parseFloat(currentUserData.quizNumber) || 0,
      completedCourses: parseInt(currentUserData.completedCourses) || 0,
      averageScore: parseFloat(currentUserData.averageScore) || 0,
      pharmacyName: currentUserData.pharmacyName
    } : {
      totalPoints: 0,
      quizPoints: 0,
      quizNumber: 0,
      completedCourses: 0,
      averageScore: 0,
      pharmacyName: currentUser.key?.pharmacy?.name || 'Non spécifiée'
    };

    const formattedRanking = usersWithSameRole.map((user, index) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      img_link: user.img_link,
      pharmacyName: user.pharmacyName || 'Non spécifiée',
      totalPoints: parseFloat(user.totalPoints) || 0,
      quizPoints: parseFloat(user.quizPoints) || 0,
      quizNumber: parseFloat(user.quizNumber) || 0,
      completedCourses: parseInt(user.completedCourses) || 0,
      averageScore: parseFloat(user.averageScore) || 0,
      position: index + 1,
      isCurrentUser: user.id === userId
    }));

    return {
      ranking: formattedRanking,
      userPosition: currentUserRank,
      totalUsers: usersWithSameRole.length,
      userStats: currentUserStats
    };
  } catch (error) {
    console.error('Error in getUserRankingByRoleAlternative:', error);
    throw error;
  }
};

// Fonction utilitaire pour formater le temps
export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
};