import * as admin from 'firebase-admin';

export class FirebaseNotificationService {
  private static initialized = false;

  private static initialize() {
    if (!this.initialized && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        
        this.initialized = true;
        console.log('✅ Firebase initialized');
      } catch (error) {
        console.error('❌ Firebase init failed (check env vars):', error);
      }
    }
  }

  /**
   * Send notification about new course - TOPIC BASED (no tokens!)
   */
  async sendNewCourseNotification(courseTitle: string, courseId: string) {
    try {
      FirebaseNotificationService.initialize();
      
      // Skip if Firebase not configured
      if (!FirebaseNotificationService.initialized) {
        console.log('⚠️ Firebase not configured - skipping notification');
        return { success: false, message: 'Firebase not configured' };
      }

      const message = {
        notification: {
          title: '🎓 New Course Available!',
          body: `"${courseTitle}" has been added. Check it out now!`,
        },
        data: {
          type: 'new_course',
          courseId: courseId,
          screen: 'course_details'
        },
        topic: 'all_users', // ✅ NO TOKENS NEEDED!
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log(`✅ Course notification sent to all users: ${response}`);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Don't throw - don't break course creation
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
export default new FirebaseNotificationService();