import { redirect } from 'next/navigation';

export default function AppRoot() {
  // Redirect root to dashboard or journal by default
  redirect('/journal');
}
