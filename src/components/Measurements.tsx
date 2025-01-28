import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { databaseService } from '@/services/DatabaseService';
import type { Measurements as MeasurementsType } from '@/types';

export function Measurements() {
  const [measurements, setMeasurements] = useState<MeasurementsType>({
    id: crypto.randomUUID(),
    userId: '', // This will be set from the auth context
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    chest: 0,
    chest2: 0,
    waist: 0,
    hips: 0,
    rightArm: 0,
    leftArm: 0,
    rightThigh: 0,
    leftThigh: 0,
    rightCalf: 0,
    leftCalf: 0,
    notes: ''
  });

  const handleInputChange = (field: keyof MeasurementsType, value: string) => {
    if (field === 'notes' || field === 'date') {
      setMeasurements({ ...measurements, [field]: value });
    } else if (field !== 'id' && field !== 'userId') {
      setMeasurements({ ...measurements, [field]: parseFloat(value) || 0 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseService.setMeasurements(measurements);
      // Reset form or show success message
    } catch (error) {
      console.error('Failed to save measurements:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={measurements.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chest">Chest (inches)</Label>
              <Input
                id="chest"
                type="number"
                value={measurements.chest || ''}
                onChange={(e) => handleInputChange('chest', e.target.value)}
                placeholder="Enter chest measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chest2">Chest 2 (inches)</Label>
              <Input
                id="chest2"
                type="number"
                value={measurements.chest2 || ''}
                onChange={(e) => handleInputChange('chest2', e.target.value)}
                placeholder="Enter second chest measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Waist (inches)</Label>
              <Input
                id="waist"
                type="number"
                value={measurements.waist || ''}
                onChange={(e) => handleInputChange('waist', e.target.value)}
                placeholder="Enter waist measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hips">Hips (inches)</Label>
              <Input
                id="hips"
                type="number"
                value={measurements.hips || ''}
                onChange={(e) => handleInputChange('hips', e.target.value)}
                placeholder="Enter hips measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leftArm">Left Arm (inches)</Label>
              <Input
                id="leftArm"
                type="number"
                value={measurements.leftArm || ''}
                onChange={(e) => handleInputChange('leftArm', e.target.value)}
                placeholder="Enter left arm measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rightArm">Right Arm (inches)</Label>
              <Input
                id="rightArm"
                type="number"
                value={measurements.rightArm || ''}
                onChange={(e) => handleInputChange('rightArm', e.target.value)}
                placeholder="Enter right arm measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leftThigh">Left Thigh (inches)</Label>
              <Input
                id="leftThigh"
                type="number"
                value={measurements.leftThigh || ''}
                onChange={(e) => handleInputChange('leftThigh', e.target.value)}
                placeholder="Enter left thigh measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rightThigh">Right Thigh (inches)</Label>
              <Input
                id="rightThigh"
                type="number"
                value={measurements.rightThigh || ''}
                onChange={(e) => handleInputChange('rightThigh', e.target.value)}
                placeholder="Enter right thigh measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leftCalf">Left Calf (inches)</Label>
              <Input
                id="leftCalf"
                type="number"
                value={measurements.leftCalf || ''}
                onChange={(e) => handleInputChange('leftCalf', e.target.value)}
                placeholder="Enter left calf measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rightCalf">Right Calf (inches)</Label>
              <Input
                id="rightCalf"
                type="number"
                value={measurements.rightCalf || ''}
                onChange={(e) => handleInputChange('rightCalf', e.target.value)}
                placeholder="Enter right calf measurement"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={measurements.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
            />
          </div>
          <Button type="submit" className="w-full">Save Measurements</Button>
        </CardContent>
      </Card>
    </form>
  );
} 