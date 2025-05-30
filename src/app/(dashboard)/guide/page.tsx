'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { HelpCircle, Target, Droplets, Moon, Footprints, Heart, Brain, Utensils, TrendingUp, ChevronRight, Info, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function GuidePage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  const programPhases = [
    {
      weeks: '1-3',
      title: 'Foundation Phase',
      icon: Target,
      color: 'brand-pink',
      description: 'Building basic healthy habits',
      goals: [
        'Drink 8+ glasses (64+ oz) of water daily',
        'Sleep 7-9 hours each night',
        'Walk 10,000 steps daily',
        'Log meals and track if you were distracted while eating'
      ],
      focus: 'Establishing consistency and awareness',
      tips: [
        'Set reminders for water intake throughout the day',
        'Create a consistent bedtime routine',
        'Park farther away or take stairs to increase steps',
        'Put away phones and turn off TV during meals'
      ]
    },
    {
      weeks: '4-6',
      title: 'Hunger Awareness Phase',
      icon: Brain,
      color: 'brand-blue',
      description: 'Learning to recognize true hunger',
      goals: [
        'Continue water, sleep, and steps goals',
        'Track hunger levels before meals',
        'Wait 30-60 minutes when hungry before eating',
        'Practice eating more slowly'
      ],
      focus: 'Understanding hunger vs. cravings',
      tips: [
        'Rate hunger on a scale of 1-10 before eating',
        'Notice physical hunger sensations (empty stomach, low energy)',
        'Distinguish between hunger and emotional eating',
        'Put fork down between bites to slow eating pace'
      ],
      newInfo: {
        title: 'What is Hunger?',
        content: 'Hunger feels like an "empty hollow sensation" in your stomach. It may come and go in waves and tends to build over time. Learn to distinguish true hunger from cravings or emotional desires to eat.'
      }
    },
    {
      weeks: '7-9',
      title: 'Satisfaction Phase',
      icon: Heart,
      color: 'brand-mint',
      description: 'Mastering mindful eating',
      goals: [
        'Continue all previous goals',
        'Track fullness levels after meals (goal: 5-7)',
        'Stop eating when satisfied, not stuffed',
        'Reduce treat frequency compared to weeks 4-6'
      ],
      focus: 'Finding your satisfaction sweet spot',
      tips: [
        'Pause halfway through meals to assess fullness',
        'Save leftovers when you feel satisfied',
        'Notice how different fullness levels feel in your body',
        'Celebrate non-scale victories like energy and mood'
      ],
      newInfo: {
        title: 'The Fullness Scale',
        content: 'Aim for 5-7 on the fullness scale after meals. This is the "just right" zone where you feel satisfied but not uncomfortable. It takes practice to recognize these subtle body signals.'
      }
    }
  ]

  const generalTips = {
    title: 'Keys to Success',
    items: [
      {
        icon: TrendingUp,
        title: 'Progress Over Perfection',
        description: 'Focus on consistency, not perfection. Small daily improvements add up to big changes.'
      },
      {
        icon: Heart,
        title: 'Be Kind to Yourself',
        description: 'This is a learning process. Celebrate wins and learn from challenges without judgment.'
      },
      {
        icon: Utensils,
        title: 'No Forbidden Foods',
        description: 'All foods can fit. The goal is to eat mindfully and understand your body&apos;s signals.'
      },
      {
        icon: Brain,
        title: 'Trust the Process',
        description: 'Weight loss happens naturally when you honor hunger and fullness cues consistently.'
      }
    ]
  }

  const weeklyHabits = {
    '1-3': {
      title: 'Weeks 1-3: Foundation Building',
      goals: ['Track water, sleep, and steps daily', 'Log all meals and snacks', 'Note if distracted while eating', 'Identify one daily win'],
      instructions: [
        'Focus on building one habit at a time',
        'Use the app daily - consistency is key',
        'Don&apos;t worry about being perfect',
        'Celebrate small victories'
      ]
    },
    '4-6': {
      title: 'Weeks 4-6: Hunger Awareness',
      goals: ['All previous habits', 'Feel hunger 30-60 min before meals', 'Eat more slowly', 'Track hunger duration'],
      instructions: [
        'Rate hunger before each meal',
        'Wait when you first feel hungry',
        'Put fork down between bites',
        'Notice hunger patterns throughout the day'
      ],
      newInfo: {
        title: 'New This Phase!',
        content: 'Start tracking how long you&apos;ve been hungry before meals. Goal: 30-60 minutes of hunger indicates a healthy calorie deficit for gradual weight loss.'
      }
    },
    '7-9': {
      title: 'Weeks 7-9: Satisfaction Mastery',
      goals: ['All previous habits', 'Stop at 5-7 fullness', 'Track fullness after meals', 'Reduce treat frequency'],
      instructions: [
        'Pause mid-meal to check fullness',
        'Save food when satisfied',
        'Notice energy levels at different fullness',
        'Practice leaving food on your plate'
      ],
      newInfo: {
        title: 'Research Insight',
        content: 'Eating 6 meals vs 3 meals daily shows no metabolic advantage. Focus on eating when truly hungry, not by the clock.'
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Program Guide</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your roadmap to the Nine Week Challenge
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-brand-pink bg-gradient-to-br from-brand-pink/5 to-brand-mint/5 animate-fade-in-delay">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-pink" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">Welcome to your transformation journey! Here&apos;s what to do:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-brand-pink font-bold">1.</span>
              <span className="text-sm">Track your daily habits (water, sleep, steps) every day</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-pink font-bold">2.</span>
              <span className="text-sm">Take body measurements on weeks 1, 3, 5, 7, and 9</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-pink font-bold">3.</span>
              <span className="text-sm">Follow the phase-specific goals for your current week</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-pink font-bold">4.</span>
              <span className="text-sm">Celebrate daily wins - no victory is too small!</span>
            </div>
          </div>
          <div className="pt-2">
            <Link href="/tracking">
              <Button variant="brand" size="sm" className="w-full sm:w-auto">
                Start Today&apos;s Tracking
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Program Phases */}
      <div className="space-y-4 animate-fade-in-delay-2">
        <h2 className="text-xl font-semibold">Program Phases</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {programPhases.map((phase, index) => {
            const Icon = phase.icon
            return (
              <Card key={phase.weeks} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 text-${phase.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      Weeks {phase.weeks}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2">{phase.title}</CardTitle>
                  <CardDescription className="text-sm">{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Focus</h4>
                    <p className="text-sm text-muted-foreground">{phase.focus}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Daily Goals</h4>
                    <ul className="space-y-1">
                      {phase.goals.map((goal, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className={`text-${phase.color} mt-0.5`}>•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {phase.newInfo && (
                    <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-3">
                      <h5 className="font-semibold text-xs mb-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {phase.newInfo.title}
                      </h5>
                      <p className="text-xs text-muted-foreground">{phase.newInfo.content}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedWeek(expandedWeek === index ? null : index)}
                  >
                    {expandedWeek === index ? 'Hide' : 'View'} Tips
                  </Button>

                  {expandedWeek === index && (
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="font-semibold text-sm">Tips for Success</h4>
                      <ul className="space-y-1">
                        {phase.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-brand-mint mt-0.5">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Daily Habits by Week */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Habit Tracker</CardTitle>
          <CardDescription>What to focus on each week</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1-3" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1-3">Weeks 1-3</TabsTrigger>
              <TabsTrigger value="4-6">Weeks 4-6</TabsTrigger>
              <TabsTrigger value="7-9">Weeks 7-9</TabsTrigger>
            </TabsList>

            {Object.entries(weeklyHabits).map(([key, week]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">{week.title}</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Daily Goals</h4>
                      <ul className="space-y-1">
                        {week.goals.map((goal, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-brand-pink mt-0.5">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions</h4>
                      <ul className="space-y-1">
                        {week.instructions.map((instruction, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-brand-blue mt-0.5">•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {'newInfo' in week && week.newInfo && (
                    <div className="mt-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-1">{week.newInfo.title}</h4>
                      <p className="text-sm text-muted-foreground">{week.newInfo.content}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* General Tips */}
      <Card>
        <CardHeader>
          <CardTitle>{generalTips.title}</CardTitle>
          <CardDescription>Important principles for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {generalTips.items.map((tip, index) => {
              const Icon = tip.icon
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-pink/10 to-brand-mint/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-pink" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">What if I miss a day of tracking?</h4>
            <p className="text-sm text-muted-foreground">
              Just pick up where you left off! This program is about progress, not perfection. One missed day won&apos;t derail your success.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">Can I eat my favorite foods?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! No foods are off-limits. The goal is to eat mindfully and honor your hunger and fullness cues with all foods.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">What if I&apos;m not losing weight?</h4>
            <p className="text-sm text-muted-foreground">
              Focus on the habits and behaviors, not the scale. Weight loss is a natural byproduct of consistently honoring your body&apos;s signals. Also track non-scale victories like energy, mood, and how clothes fit.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">How do I know if I&apos;m truly hungry?</h4>
            <p className="text-sm text-muted-foreground">
              True hunger feels like an empty, hollow sensation in your stomach. It builds gradually and comes in waves. If you&apos;re unsure, wait 20-30 minutes - true hunger will persist or intensify.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-brand-pink/10 to-brand-mint/10 border-0">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">Ready to Transform Your Relationship with Food?</h3>
            <p className="text-sm text-muted-foreground">
              You have everything you need to succeed. Trust the process and be patient with yourself.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/tracking">
                <Button variant="brand">Start Tracking</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">View Dashboard</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}