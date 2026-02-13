export interface Stats {
  users: {
    countAllUsers: number,
    countPreviousMonthUsers: number,
    countCurrentMonthUsers: number,
    percentageUsers: number | null
  },
  pharmacies: {
    countAllPharmacies: number,
    countPreviousMonthPharmacies: number,
    countCurrentMonthPharmacies: number,
    percentagePharmacies: number | null
  }
}
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}
