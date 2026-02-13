
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const today = new Date()
const oneYearFromNow = today.getFullYear();
const currentMonth = `${today.getMonth() + 1}`.padStart(2, "0");
const currentDay = `${today.getDate()}`.padStart(2, "0")
export const environment = {
  url: 'https://pharmacare-api-443e16f678fa.herokuapp.com',
  apiEndpoint: 'https://pharmacare-api-443e16f678fa.herokuapp.com/api/v1',
  //url: 'http://localhost:3000',
  //apiEndpoint: 'http://localhost:3000/api/v1/',
  production: true,
  Basic: {
    language: 'en', // this could be an environment variable, or setup in a config service externally
  },
  Storage: {
    Key: 'key',
    Timeout: 168, // a week
    ResetKey: `${oneYearFromNow+1}${currentMonth}${currentDay}`, // yyyymmdd is best option
  },
  Security: {
    key: 'key'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
