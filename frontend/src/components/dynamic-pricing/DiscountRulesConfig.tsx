import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Percent,
  ArrowRight,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import type { DiscountRule, EvaluateRuleResponse } from '@/integrations/backend/types';

interface DiscountRulesConfigProps {
  eventId: string;
  eventTitle: string;
  onRulesUpdated?: () => void;
}

export function DiscountRulesConfig({ eventId, eventTitle, onRulesUpdated }: DiscountRulesConfigProps) {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateRuleResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_description: '',
    occupancy_threshold: 50,
    time_threshold: 24,
    time_unit: 'hours' as 'hours' | 'days',
    discount_percent: 20,
    is_active: true,
    priority: 100,
  });

  // Load rules on mount
  useEffect(() => {
    loadRules();
  }, [eventId]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      // Get rules for this specific event AND global rules
      const data = await apiClient.listDiscountRules(eventId);
      setRules(data);
    } catch (error) {
      toast.error('Failed to load discount rules');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_description: '',
      occupancy_threshold: 50,
      time_threshold: 24,
      time_unit: 'hours',
      discount_percent: 20,
      is_active: true,
      priority: 100,
    });
    setEditingRule(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: DiscountRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_description: rule.rule_description || '',
      occupancy_threshold: rule.occupancy_threshold,
      time_threshold: rule.time_threshold,
      time_unit: rule.time_unit,
      discount_percent: rule.discount_percent,
      is_active: rule.is_active,
      priority: rule.priority,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRule) {
        await apiClient.updateDiscountRule(editingRule.id, {
          ...formData,
          event_id: editingRule.event_id === eventId ? eventId : undefined,
        });
        toast.success('Rule updated successfully');
      } else {
        await apiClient.createDiscountRule({
          ...formData,
          event_id: eventId,
        });
        toast.success('Rule created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadRules();
      onRulesUpdated?.();
    } catch (error) {
      toast.error('Failed to save rule');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await apiClient.deleteDiscountRule(ruleId);
      toast.success('Rule deleted successfully');
      loadRules();
      onRulesUpdated?.();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const handleTestRule = async () => {
    setIsEvaluating(true);
    try {
      // Get current inventory for occupancy
      const history = await apiClient.getInventoryHistory(eventId);
      const latestSnapshot = history.snapshots[0];
      const occupancy = latestSnapshot?.occupancy_percent || 0;
      
      // Calculate hours before event (this is a simplified calculation)
      // In real implementation, you'd fetch event details
      const hoursBefore = 48; // Default test value
      
      const result = await apiClient.evaluateDiscountRules(eventId, occupancy, hoursBefore);
      setEvaluationResult(result);
    } catch (error) {
      toast.error('Failed to evaluate rules');
    } finally {
      setIsEvaluating(false);
    }
  };

  const generateRecommendation = async () => {
    try {
      const result = await apiClient.generateRuleBasedRecommendation(eventId);
      toast.success(`Generated ${result.recommended_discount_percent}% discount recommendation`);
      onRulesUpdated?.();
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('404')) {
        toast.info('No rules matched current conditions. Update inventory or adjust rule thresholds.');
      } else {
        toast.error('Failed to generate recommendation');
      }
    }
  };

  const getRuleScope = (rule: DiscountRule) => {
    return rule.event_id === eventId ? 'Event-specific' : 'Global';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Discount Rules</h3>
          <p className="text-sm text-muted-foreground">
            Create automated rules that generate discount recommendations based on occupancy and time.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestRule}
            disabled={isEvaluating || rules.length === 0}
          >
            {isEvaluating ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Test Rules
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendation}
            disabled={rules.length === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Rec
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {evaluationResult && (
        <Card className={evaluationResult.rule_matched ? 'border-green-500' : 'border-yellow-500'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {evaluationResult.rule_matched ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {evaluationResult.rule_matched ? 'Rule Matched!' : 'No Rule Matched'}
                </p>
                <p className="text-sm text-muted-foreground">{evaluationResult.message}</p>
                {evaluationResult.rule_matched && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="default" className="text-lg">
                      {evaluationResult.discount_percent}% OFF
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      via rule: {evaluationResult.rule_name}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEvaluationResult(null)}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules Table */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No discount rules yet</p>
            <p className="text-sm mb-4">
              Create rules to automatically generate discount recommendations when occupancy is low.
            </p>
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.rule_name}</div>
                      {rule.rule_description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {rule.rule_description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Priority: {rule.priority}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Occupancy &lt; {rule.occupancy_threshold}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Within {rule.time_threshold} {rule.time_unit}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-lg font-semibold">
                        <Percent className="w-3 h-3 mr-1" />
                        {rule.discount_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRuleScope(rule)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={async (checked) => {
                          try {
                            await apiClient.updateDiscountRule(rule.id, { is_active: checked });
                            loadRules();
                            onRulesUpdated?.();
                          } catch (error) {
                            toast.error('Failed to update rule');
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            How Rule-Based Recommendations Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>1. Set Conditions:</strong> Define occupancy threshold (e.g., below 50% sold) and time window (e.g., within 24 hours of event).
          </p>
          <p>
            <strong>2. Automatic Trigger:</strong> When BOTH conditions are met, the system generates a discount recommendation.
          </p>
          <p>
            <strong>3. Priority Matching:</strong> If multiple rules match, the one with lowest priority number wins.
          </p>
          <p>
            <strong>4. Manual Approval:</strong> Review and approve recommendations to generate promo codes.
          </p>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Discount Rule' : 'Create Discount Rule'}
            </DialogTitle>
            <DialogDescription>
              Define when to automatically suggest discounts based on event occupancy and timing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., Last Minute Discount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_description">Description (Optional)</Label>
              <Textarea
                id="rule_description"
                value={formData.rule_description}
                onChange={(e) => setFormData({ ...formData, rule_description: e.target.value })}
                placeholder="Brief description of when this rule applies"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupancy_threshold">Occupancy Threshold (%)</Label>
                <Input
                  id="occupancy_threshold"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.occupancy_threshold}
                  onChange={(e) => setFormData({ ...formData, occupancy_threshold: parseInt(e.target.value) || 50 })}
                />
                <p className="text-xs text-muted-foreground">
                  Trigger when occupancy BELOW this%
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount (%)</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 20 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_threshold">Time Window</Label>
                <Input
                  id="time_threshold"
                  type="number"
                  min={1}
                  value={formData.time_threshold}
                  onChange={(e) => setFormData({ ...formData, time_threshold: parseInt(e.target.value) || 24 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_unit">Unit</Label>
                <Select
                  value={formData.time_unit}
                  onValueChange={(v: 'hours' | 'days') => setFormData({ ...formData, time_unit: v })}
                >
                  <SelectTrigger id="time_unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-999)</Label>
              <Input
                id="priority"
                type="number"
                min={1}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
              />
              <p className="text-xs text-muted-foreground">
                Lower number = higher priority when multiple rules match
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            {/* Rule Preview */}
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Rule Preview:</p>
              <p className="text-muted-foreground">
                When occupancy is below {formData.occupancy_threshold}% and event is within{' '}
                {formData.time_threshold} {formData.time_unit},{' '}
                <span className="font-semibold text-foreground">
                  suggest {formData.discount_percent}% discount
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.rule_name.trim()}>
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
