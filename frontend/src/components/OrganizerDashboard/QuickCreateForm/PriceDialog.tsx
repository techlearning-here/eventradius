import { Ticket } from 'lucide-react';
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

interface PriceDialogProps {
  isOpen: boolean;
  tempPrice: string;
  onTempPriceChange: (value: string) => void;
  onClose: () => void;
  onSave: (price: number) => void;
}

export const PriceDialog = ({
  isOpen,
  tempPrice,
  onTempPriceChange,
  onClose,
  onSave,
}: PriceDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Set Ticket Price
        </DialogTitle>
        <DialogDescription>
          Enter the ticket price for this event. Set to 0 for free events.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={tempPrice}
            onChange={(e) => onTempPriceChange(e.target.value)}
            className="text-lg"
            autoFocus
          />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const numPrice = parseFloat(tempPrice);
            if (!isNaN(numPrice) && numPrice >= 0) {
              onSave(numPrice);
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save Price
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
