import { GymStats, TrainerStats } from '../types';

const API_URL = 'https://royalfitness.fit/royal_api/dashboard.php';
//const API_URL = 'http://localhost/royal_api/dashboard.php';

export async function fetchDashboardData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
