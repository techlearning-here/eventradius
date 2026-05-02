import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UrlDialogProps {
  isOpen: boolean;
  tempUrl: string;
  onTempUrlChange: (value: string) => void;
  onClose: () => void;
  onSave: (url: string) => void;
}

export const UrlDialog = ({
  isOpen,
  tempUrl,
  onTempUrlChange,
  onClose,
  onSave,
}: UrlDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Ticket Purchase Link
        </DialogTitle>
        <DialogDescription>
          Enter the external URL where attendees can purchase tickets.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input
          type="url"
          placeholder="https://eventbrite.com/your-event"
          value={tempUrl}
          onChange={(e) => onTempUrlChange(e.target.value)}
          className="text-sm"
          autoFocus
        />
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onSave(tempUrl.trim());
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save Link
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
