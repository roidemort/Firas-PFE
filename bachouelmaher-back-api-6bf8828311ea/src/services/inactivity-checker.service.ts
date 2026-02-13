//import { CronJob } from 'cron';

export class InactivityCheckerService {
  //private job: CronJob | null = null;

  start() {
    // Just log that service started - Flutter will handle inactivity locally
    console.log('⏰ Inactivity checker disabled - Flutter handles locally');
  }

  stop() {
    console.log('⏰ Inactivity checker stopped');
  }
}

export default new InactivityCheckerService();