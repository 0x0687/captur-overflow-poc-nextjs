"use client"

import { MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useLocationTrackerSettings, AgeRange, Gender } from './providers/tracker-settings-provider'

export default function LocationTrackerSettings() {
    const { ageRange, gender, setAgeRange, setGender } = useLocationTrackerSettings()

    const showUpdateConfirmation = (setting: string) => {
        toast.success(`${setting} setting updated successfully`)
    }

    const handleAgeChange = (value: AgeRange) => {
        setAgeRange(value)
        showUpdateConfirmation('Age range')
    }

    const handleGenderChange = (value: Gender) => {
        setGender(value)
        showUpdateConfirmation('Gender')
    }

    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader className="space-y-1">
                <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    <CardTitle>Location Tracker Settings</CardTitle>
                </div>
                <CardDescription>Configure your privacy settings for the DePIN location tracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Age Range</h3>
                    <RadioGroup value={ageRange} onValueChange={handleAgeChange} className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="under-18" id="under-18" />
                            <Label htmlFor="under-18">Under 18</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="18-25" id="18-25" />
                            <Label htmlFor="18-25">18-25</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="26-40" id="26-40" />
                            <Label htmlFor="26-40">26-40</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="40-plus" id="40-plus" />
                            <Label htmlFor="40-plus">40+</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Gender</h3>
                    <RadioGroup value={gender} onValueChange={handleGenderChange} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <p>
                        Your privacy is important to us. These settings help us provide better service while respecting your
                        preferences.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}