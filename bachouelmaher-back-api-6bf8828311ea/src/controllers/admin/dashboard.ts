import { NextFunction, Request, Response } from "express"
import moment from "moment"
import * as _ from "lodash";

import RedisService from "@/services/redis.service"
import { Between, Not } from "typeorm"
import { countUsers, getNbrUsersByMonth } from "@/services/user.service"
import { countSubscriptions, getNbrSubscriptionsByMonth } from "@/services/subscription.service"
import { countPharmacies } from "@/services/pharmacy.service"
import { countCourses } from "@/services/course.service"
import {
  countEnrollCourses,
  getStatsByCategory,
  getStatsByCourse,
  getStatsByStatus, getStatsByType
} from "@/services/enroll-course.service"

export const main = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = moment(new Date()).format("YYYY-MM-DD")
    const datePreviousMonthFrom = moment(new Date()).subtract(1,'months').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const datePreviousMonthEnd = moment(new Date()).subtract(1,'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const dateCurrentMonthFrom = moment(new Date()).subtract(0,'months').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const dateCurrentMonthEnd = moment(new Date()).subtract(0,'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const countAllUsers = await countUsers({ role : Not('SUPER_ADMIN')})
    const countPreviousMonthUsers = await countUsers({ createdAt: Between(datePreviousMonthFrom, datePreviousMonthEnd), role : Not('SUPER_ADMIN') });
    const countCurrentMonthUsers = await countUsers({ createdAt: Between(dateCurrentMonthFrom, dateCurrentMonthEnd), role : Not('SUPER_ADMIN') });
    const percentageUsers = (countCurrentMonthUsers - countPreviousMonthUsers) / (countPreviousMonthUsers | 1) * 100 | 0;

    const users = { countAllUsers: Number(countAllUsers) | 0, countPreviousMonthUsers, countCurrentMonthUsers, percentageUsers }

    const countAllPharmacies = await countPharmacies({})
    const countPreviousMonthPharmacies = await countPharmacies({ createdAt: Between(datePreviousMonthFrom, datePreviousMonthEnd) });
    const countCurrentMonthPharmacies = await countPharmacies({ createdAt: Between(dateCurrentMonthFrom, dateCurrentMonthEnd) });
    const percentagePharmacies = (countCurrentMonthPharmacies - countPreviousMonthPharmacies) / (countPreviousMonthPharmacies | 1) * 100 | 0;

    const pharmacies = { countAllPharmacies: Number(countAllPharmacies) | 0, countPreviousMonthPharmacies, countCurrentMonthPharmacies, percentagePharmacies }

    const countAllCourses = await countCourses({})
    const countPreviousMonthCourses = await countCourses({ createdAt: Between(datePreviousMonthFrom, datePreviousMonthEnd) });
    const countCurrentMonthCourses = await countCourses({ createdAt: Between(dateCurrentMonthFrom, dateCurrentMonthEnd) });
    const percentageCourses = (countCurrentMonthCourses - countPreviousMonthCourses) / (countPreviousMonthCourses | 1) * 100  | 0;

    const courses = { countAllCourses: Number(countAllCourses) | 0, countPreviousMonthCourses, countCurrentMonthCourses, percentageCourses }

    const countAllSubscriptions = await countSubscriptions({package: { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}})
    const countPreviousMonthSubscriptions = await countSubscriptions({ createdAt: Between(datePreviousMonthFrom, datePreviousMonthEnd), package: { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')} });
    const countCurrentMonthSubscriptions = await countSubscriptions({ createdAt: Between(dateCurrentMonthFrom, dateCurrentMonthEnd), package: { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')} });
    const percentageSubscriptions = (countCurrentMonthSubscriptions - countPreviousMonthSubscriptions) / (countPreviousMonthSubscriptions | 1) * 100 | 0;

    const subscriptions = { countAllSubscriptions: Number(countAllSubscriptions) | 0, countPreviousMonthSubscriptions, countCurrentMonthSubscriptions, percentageSubscriptions }

    const NbrUsersQuery = await getNbrUsersByMonth()
    const NbrSubscriptionsQuery = await getNbrSubscriptionsByMonth()

    const countAllEnroll = await getStatsByStatus()
    const countAllEnrollCoursesCategory = await getStatsByCategory()
    const countAllEnrollCourses = await getStatsByCourse()
    const countAllEnrollTypes = await getStatsByType()

    const NbrUsers = Array.from({ length: 12 }, (_, i) => {
      const user = NbrUsersQuery.find(o => o.month === i + 1);
      return user ? Number(user.count) : 0;
    });

    const enrolls = _.groupBy(countAllEnroll, enroll => enroll.status);

    const NbrSubscriptions = Array.from({ length: 12 }, (_, i) => {
      const subscription = NbrSubscriptionsQuery.find(o => o.month === i + 1);
      return subscription ? Number(subscription.count) : 0;
    });

    const enrollProgress = Array.from({ length: 12 }, (_, i) => {
      let subscription = { count : 0 }
      if(enrolls && enrolls.length) subscription = enrolls['1'].find(o => o.month === i + 1);
      return subscription ? Number(subscription.count) : 0;
    });

    const enrollComplete = Array.from({ length: 12 }, (_, i) => {
      let subscription = { count : 0 }
      if(enrolls && enrolls.length) subscription = enrolls['1'].find(o => o.month === i + 1);
      return subscription ? Number(subscription.count) : 0;
    });

    const seriesEnroll = [
      {
        name: "Commencé",
        data: enrollProgress
      },
      {
        name: "Terminé",
        data: enrollComplete
      }
    ]

    const seriesEnrollCategoryNames = _.map(countAllEnrollCoursesCategory, 'name')
    const seriesEnrollCategoryData = _.map(countAllEnrollCoursesCategory, enroll => { return Number(enroll.count) })
    const seriesEnrollCategory = {
      seriesEnrollCategoryNames,
      seriesEnrollCategoryData
    }

    const seriesEnrollCourseNames = _.map(countAllEnrollCourses, 'title')
    const seriesEnrollCourseData = _.map(countAllEnrollCourses, enroll => { return Number(enroll.count) })
    const seriesEnrollCourse = {
      xaxis: { categories: seriesEnrollCourseNames },
      series: [{ data: seriesEnrollCourseData }]
    }
    let paid = _.find(countAllEnrollTypes, function(o) { return o.paid === 1 });
    let free = _.find(countAllEnrollTypes, function(o) { return o.paid === 0 });

    paid = paid? Number(paid.count) : 0;
    free = free? Number(free.count) : 0;

    const seriesEnrollType = {
      series: [free, paid],
      labels: ['Gratuit', 'Payant']
    }

    const dataUsers = [{
      name: 'Membres',
      data: NbrUsers
    }]

    const dataSubscriptions = [{
      name: 'Abonnements',
      data: NbrSubscriptions
    }]

    return res.customSuccess(
      200,
      'Main Dashboard',
      { users, pharmacies, courses, subscriptions, dataUsers, dataSubscriptions, seriesEnroll, seriesEnrollCategory, seriesEnrollCourse, seriesEnrollType },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};