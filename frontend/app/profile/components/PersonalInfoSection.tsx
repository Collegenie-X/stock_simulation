'use client';

import { useState } from 'react';
import { Pencil, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import { PROFILE_LABELS } from '../config';

const L = PROFILE_LABELS.personalInfo;

interface PersonalInfoProps {
  userId: string;
  email: string;
  phone: string;
  joinDate: string;
  lastLogin: string;
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  onEdit?: () => void;
}

function InfoRow({ label, value, onEdit }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-white flex-1 text-right mr-2">{value}</span>
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 px-2 py-1 bg-blue-500/10 rounded-lg"
        >
          {L.editBtn}
        </button>
      )}
    </div>
  );
}

export function PersonalInfoSection({ userId, email, phone, joinDate, lastLogin }: PersonalInfoProps) {
  const [showPw, setShowPw] = useState(false);

  const maskedEmail = email.replace(/(?<=.{2}).(?=[^@]*@)/g, '*');

  return (
    <section className="mt-5">
      <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">{L.title}</p>

      <div className="bg-[#252525] rounded-2xl px-4 border border-white/5">
        <InfoRow label={L.userId} value={userId} />

        {/* 비밀번호 행 — 표시/숨김 토글 */}
        <div className="flex items-center justify-between py-3.5 border-b border-white/5">
          <span className="text-sm text-gray-400 w-24 flex-shrink-0">{L.password}</span>
          <span className="text-sm text-white flex-1 text-right mr-2 tracking-widest">
            {showPw ? '********' : L.passwordMask}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPw((v) => !v)}
              className="text-gray-500 hover:text-white p-1"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded-lg">
              {L.editBtn}
            </button>
          </div>
        </div>

        <InfoRow label={L.email}     value={maskedEmail}  onEdit={() => {}} />
        <InfoRow label={L.phone}     value={phone} onEdit={() => {}} />
        <InfoRow label={L.joinDate}  value={joinDate} />
        <InfoRow label={L.lastLogin} value={lastLogin} />
      </div>

      {/* 로그아웃 */}
      <button className="w-full flex items-center justify-center gap-2 mt-3 py-3 text-sm text-gray-500 hover:text-red-400 transition-colors">
        <LogOut className="w-4 h-4" />
        {PROFILE_LABELS.logout}
      </button>

      {/* 회원 탈퇴 */}
      <div className="mt-1 mb-2 flex flex-col items-center gap-1">
        <button className="text-xs text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          {L.withdrawBtn}
        </button>
        <p className="text-xs text-gray-700">{L.withdrawDesc}</p>
      </div>
    </section>
  );
}
