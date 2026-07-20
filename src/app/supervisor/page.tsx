import { redirect } from 'next/navigation';

export default function SupervisorRedirectPage() {
  redirect('/dashboard/supervisor');
}
