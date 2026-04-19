import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Link2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle,
  ListOrdered,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ApprovalRequestResponse, ApprovalStatus } from '@/integrations/backend/types';

interface ApprovalRequestCardProps {
  request: ApprovalRequestResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAction: (participantId: string, action: 'approve' | 'reject' | 'waitlist') => void;
  processingId: string | null;
}

interface StatusConfig {
  icon: typeof Clock;
  color: string;
  label: string;
}

function getStatusConfig(status: ApprovalStatus, waitlistPosition?: number): StatusConfig {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Pending',
      };
    case 'approved':
      return {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Approved',
      };
    case 'rejected':
      return {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Declined',
      };
    case 'waitlisted':
      return {
        icon: ListOrdered,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: waitlistPosition ? `Waitlisted #${waitlistPosition}` : 'Waitlisted',
      };
  }
}

export function ApprovalRequestCard({
  request,
  isExpanded,
  onToggleExpand,
  onAction,
  processingId,
}: ApprovalRequestCardProps) {
  const statusConfig = getStatusConfig(request.approval_status, request.waitlist_position);
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={`overflow-hidden transition-all ${
        isExpanded ? 'ring-2 ring-emerald-500/20' : ''
      }`}
    >
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
            {request.requester_name?.charAt(0).toUpperCase() || '?'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {request.requester_name || 'Unknown'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {request.requester_email}
            </p>
          </div>

          {/* Status Badge */}
          <Badge className={`${statusConfig.color} border shrink-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>

          {/* Expand Button */}
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Information
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {request.requester_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {request.requester_email}
                    </span>
                  </div>
                  {request.requester_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {request.requester_phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {(request.requester_bio || request.requester_reason) && (
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Additional Information
                  </h5>
                  <div className="space-y-2">
                    {request.requester_bio && (
                      <div className="text-sm">
                        <span className="text-gray-500">Bio:</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {request.requester_bio}
                        </p>
                      </div>
                    )}
                    {request.requester_reason && (
                      <div className="text-sm">
                        <span className="text-gray-500">Reason:</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {request.requester_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {request.requester_social_links &&
              Object.values(request.requester_social_links).some((v) => v) && (
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Social Links
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {request.requester_social_links.linkedin && (
                      <a
                        href={request.requester_social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:opacity-80"
                      >
                        <Link2 className="w-3 h-3" />
                        LinkedIn
                      </a>
                    )}
                    {request.requester_social_links.twitter && (
                      <a
                        href={request.requester_social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm hover:opacity-80"
                      >
                        <Link2 className="w-3 h-3" />
                        Twitter
                      </a>
                    )}
                    {request.requester_social_links.website && (
                      <a
                        href={request.requester_social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:opacity-80"
                      >
                        <Link2 className="w-3 h-3" />
                        Website
                      </a>
                    )}
                    {request.requester_social_links.instagram && (
                      <a
                        href={request.requester_social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm hover:opacity-80"
                      >
                        <Link2 className="w-3 h-3" />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

            {/* Requested At */}
            <div className="text-xs text-gray-500 mb-4">
              Requested: {new Date(request.registered_at).toLocaleString()}
            </div>

            {/* Action Buttons - Only for pending requests */}
            {request.approval_status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => onAction(request.id, 'reject')}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => onAction(request.id, 'waitlist')}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ListOrdered className="w-4 h-4 mr-2" />
                  )}
                  Waitlist
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onAction(request.id, 'approve')}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
