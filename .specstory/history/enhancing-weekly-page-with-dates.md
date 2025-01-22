## SpecStory

## Enhancing Weekly Page with Dates (1/21/2025, 5:10:31 PM)

_**User**_

for the weekly page, can we add week number and week dates/range of those dates so that the user knows what we we are focused on. 

---

_**Assistant**_

I'll help add the week number and date range to the weekly page. First, let me check the relevant files to see where we need to make these changes.

---

_**Assistant**_



---

_**Assistant**_



Let me check the database service to understand how we store the week dates.

---

_**Assistant**_



---

_**Assistant**_



I see that we have the week number and dates stored in the `WeeklySummary` interface. Let me update the weekly review component to display this information more prominently.

---

_**Assistant**_

```
// ... existing code ...
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
            <p className="text-muted-foreground mt-2">Week {summary.weekNumber}</p>
            <p className="text-muted-foreground">
              {new Date(summary.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })} - {new Date(summary.endDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex gap-2">
// ... existing code ...
```

---

_**Assistant**_



I've updated the weekly review component to show:
1. The week number (e.g., "Week 1")
2. The date range for that week (e.g., "January 1 - January 7")

The dates are formatted to show just the month and day for a cleaner look. This should help users better understand which week they're reviewing and the exact dates it covers. Let me know if you'd like any adjustments to the formatting or layout!

---

_**User**_

where? i dont see that change. 

---

_**Assistant**_

I see the issue - while I made the change to the code, it seems the UI in your screenshot shows a different layout. Let me update the header section to match the layout in your screenshot.

---

_**Assistant**_

```
// ... existing code ...
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Review - Week {summary.weekNumber}</h1>
            <p className="text-muted-foreground mt-2">
              {new Date(summary.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })} - {new Date(summary.endDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-muted-foreground">Review and track your weekly progress</p>
          </div>
          <div className="flex gap-2">
// ... existing code ...
```

---

_**Assistant**_



---



---

