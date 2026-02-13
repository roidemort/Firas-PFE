// src/controllers/user/getRanking.ts
import { NextFunction, Request, Response } from "express";
import { 
  getUserRankingByRole, 
  getUserRankingByPharmacy,
  getUserRankingStats 
} from "@/services/ranking.service";

export const getRankingByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.jwtPayload;

    const rankingData = await getUserRankingByRole(id);

    return res.customSuccess(200, 'Classement par rôle récupéré avec succès.', rankingData, true);
  } catch (error: any) {
    console.error('Error getting ranking by role:', error);
    return res.customSuccess(500, error.message || 'Erreur lors de la récupération du classement.', {}, false);
  }
};

export const getRankingByPharmacy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.jwtPayload;

    const rankingData = await getUserRankingByPharmacy(id);

    return res.customSuccess(200, 'Classement par pharmacie récupéré avec succès.', rankingData, true);
  } catch (error: any) {
    console.error('Error getting ranking by pharmacy:', error);
    return res.customSuccess(500, error.message || 'Erreur lors de la récupération du classement.', {}, false);
  }
};

export const getRankingStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.jwtPayload;

    const stats = await getUserRankingStats(id);

    return res.customSuccess(200, 'Statistiques de classement récupérées avec succès.', stats, true);
  } catch (error: any) {
    console.error('Error getting ranking stats:', error);
    return res.customSuccess(500, error.message || 'Erreur lors de la récupération des statistiques.', {}, false);
  }
};

// Endpoint pour les deux classements en une seule requête
export const getAllRankings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.jwtPayload;

    const [roleRanking, pharmacyRanking, stats] = await Promise.all([
      getUserRankingByRole(id),
      getUserRankingByPharmacy(id),
      getUserRankingStats(id)
    ]);

    return res.customSuccess(200, 'Classements récupérés avec succès.', {
      roleRanking,
      pharmacyRanking,
      stats
    }, true);
  } catch (error: any) {
    console.error('Error getting all rankings:', error);
    return res.customSuccess(500, error.message || 'Erreur lors de la récupération des classements.', {}, false);
  }
};