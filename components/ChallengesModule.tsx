import React from 'react';
import { MemberDashboard } from './MemberDashboard';
import { AdminDashboard } from './AdminDashboard';
import { User, UserRole } from '../types';

/* =======================
   PROPS
======================= */
type Props = {
  currentUser: User;
};

/* =======================
   COMPONENT
======================= */
const ChallengesModule: React.FC<Props> = ({ currentUser }) => {
  return (
    <div className="py-6">
      {currentUser.role === UserRole.ADMIN ? (
        // ✅ AdminDashboard يعتمد على API داخليًا
        <AdminDashboard />
      ) : (
        // ✅ MemberDashboard يعتمد على API داخليًا
        <MemberDashboard currentUser={currentUser} />
      )}
    </div>
  );
};

export default ChallengesModule;
