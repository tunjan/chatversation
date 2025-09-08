
import React from 'react';
import { Feedback, FeedbackSection } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Progress } from './ui/Progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { CheckCircle, AlertTriangle, XCircle, Award } from 'lucide-react';

interface FeedbackDialogProps {
  feedback: Feedback;
  isOpen: boolean;
  onClose: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-500';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-500';
  return 'text-red-600 dark:text-red-500';
};

const getIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
}

const FeedbackCard: React.FC<{ title: string; data: FeedbackSection }> = ({ title, data }) => (
    <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                {getIcon(data.score)}
                <h4 className="font-semibold text-foreground">{title}</h4>
            </div>
            <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>{data.score}/100</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground ml-9">{data.comment}</p>
    </div>
);

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ feedback, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Award className="mr-2 h-6 w-6" />
            Performance Feedback
          </DialogTitle>
          {/* FIX: Renamed 'Description' to 'DialogDescription' to match the import. */}
          <DialogDescription>
            A strict, uncompromising analysis of your performance.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
            <Card className="bg-muted/50 text-center p-4">
                <CardHeader className="p-2">
                    <CardTitle className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                        {feedback.overallScore}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Overall Score</p>
                </CardHeader>
                <CardContent className="p-2">
                    <p className="font-semibold text-foreground">{feedback.finalVerdict}</p>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
          <FeedbackCard title="Flowchart Adherence" data={feedback.flowchartAdherence} />
          <FeedbackCard title="Focus on Exploitation" data={feedback.focusOnExploitation} />
          <FeedbackCard title="Victim's Perspective" data={feedback.victimPerspective} />
          <FeedbackCard title="Call to Action" data={feedback.callToAction} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
