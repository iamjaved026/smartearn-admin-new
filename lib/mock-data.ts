export const dashboardStats = [
  { title: 'Total Users', value: '12,845', icon: 'users', color: 'indigo', trend: { value: '12%', isUp: true } },
  { title: 'Coins Distributed', value: '1.2M', icon: 'coins', color: 'emerald', trend: { value: '8%', isUp: true } },
  { title: 'Total Referrals', value: '4,230', icon: 'share', color: 'amber', trend: { value: '5%', isUp: true } },
  { title: 'Pending Withdraws', value: '156', icon: 'wallet', color: 'rose', trend: { value: '2%', isUp: false } },
];

export const recentReferrals = [
  { id: 1, inviter: 'John Doe', invited: 'Jane Smith', reward: '50 Coins', date: '2024-03-15' },
  { id: 2, inviter: 'Alice Brown', invited: 'Bob Wilson', reward: '50 Coins', date: '2024-03-15' },
  { id: 3, inviter: 'Charlie Davis', invited: 'Diana Prince', reward: '50 Coins', date: '2024-03-14' },
  { id: 4, inviter: 'Eve Adams', invited: 'Frank Miller', reward: '50 Coins', date: '2024-03-14' },
  { id: 5, inviter: 'Grace Hopper', invited: 'Henry Ford', reward: '50 Coins', date: '2024-03-13' },
];

export const recentWithdraws = [
  { id: 1, user: 'John Doe', amount: '₹500', upi: 'john@upi', status: 'Pending', date: '2024-03-15' },
  { id: 2, user: 'Jane Smith', amount: '₹200', upi: 'jane@paytm', status: 'Approved', date: '2024-03-15' },
  { id: 3, user: 'Bob Wilson', amount: '₹1000', upi: 'bob@ybl', status: 'Rejected', date: '2024-03-14' },
  { id: 4, user: 'Alice Brown', amount: '₹350', upi: 'alice@upi', status: 'Pending', date: '2024-03-14' },
];

export const usersData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', coins: 1250, referrals: 15, status: 'Active', referralCode: 'JOHN123' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', coins: 850, referrals: 8, status: 'Active', referralCode: 'JANE456' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', coins: 4200, referrals: 42, status: 'Banned', referralCode: 'BOB789' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', coins: 150, referrals: 2, status: 'Active', referralCode: 'ALICE101' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', coins: 3100, referrals: 28, status: 'Active', referralCode: 'CHARLIE202' },
  { id: '6', name: 'Diana Prince', email: 'diana@example.com', coins: 920, referrals: 10, status: 'Active', referralCode: 'DIANA303' },
  { id: '7', name: 'Eve Adams', email: 'eve@example.com', coins: 0, referrals: 0, status: 'Active', referralCode: 'EVE404' },
];

export const referralStats = [
  { title: 'Total Referrals', value: '4,230', icon: 'share', color: 'indigo' },
  { title: 'Top Referrers', value: '128', icon: 'award', color: 'emerald' },
  { title: 'Reward Coins Dist.', value: '211,500', icon: 'coins', color: 'amber' },
];

export const referralTracking = [
  { id: 1, inviter: 'John Doe', invited: 'Mike Ross', reward: 50, date: '2024-03-15 10:30 AM' },
  { id: 2, inviter: 'Jane Smith', invited: 'Harvey Specter', reward: 50, date: '2024-03-15 09:15 AM' },
  { id: 3, inviter: 'John Doe', invited: 'Rachel Zane', reward: 50, date: '2024-03-14 04:45 PM' },
  { id: 4, inviter: 'Bob Wilson', invited: 'Louis Litt', reward: 50, date: '2024-03-14 02:20 PM' },
  { id: 5, inviter: 'Alice Brown', invited: 'Donna Paulsen', reward: 50, date: '2024-03-13 11:05 AM' },
];

export const withdrawRequests = [
  { id: 1, user: 'John Doe', amount: 500, upi: 'john@okaxis', status: 'Pending', date: '2024-03-15' },
  { id: 2, user: 'Jane Smith', amount: 200, upi: 'jane@paytm', status: 'Approved', date: '2024-03-15' },
  { id: 3, user: 'Bob Wilson', amount: 1000, upi: 'bob@ybl', status: 'Rejected', date: '2024-03-14' },
  { id: 4, user: 'Alice Brown', amount: 350, upi: 'alice@upi', status: 'Pending', date: '2024-03-14' },
  { id: 5, user: 'Charlie Davis', amount: 1500, upi: 'charlie@okicici', status: 'Pending', date: '2024-03-13' },
];

export const chartData = [
  { name: 'Mon', users: 400, coins: 2400 },
  { name: 'Tue', users: 300, coins: 1398 },
  { name: 'Wed', users: 200, coins: 9800 },
  { name: 'Thu', users: 278, coins: 3908 },
  { name: 'Fri', users: 189, coins: 4800 },
  { name: 'Sat', users: 239, coins: 3800 },
  { name: 'Sun', users: 349, coins: 4300 },
];
