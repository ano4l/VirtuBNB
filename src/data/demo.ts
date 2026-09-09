import { Activity, Approval, Booking, Conversation, HostTask, Property, Review, TimelineEvent } from '@/src/models';

export const demoDay = {
  iso: '2026-09-07',
  label: 'Monday, 7 September',
  timezone: 'Africa/Johannesburg',
};

export const properties: Property[] = [
  {
    id: 'rosebank-loft', name: 'Rosebank Loft', area: 'Rosebank, Johannesburg', status: 'Occupied',
    occupancy: 'Same-day guest changeover', nextStay: 'Naledi checks in today at 15:00',
    syncHealth: 'Healthy', syncLabel: 'Airbnb synced 4 min ago', accent: '#BED7C9', icon: 'business-outline',
    listingStatus: 'Active on connected channel',
    activeWorkflows: ['Booking acknowledgement', 'Pre-arrival instructions', 'Cleaning handover'],
    baseNotes: ['Parking instructions reviewed today'],
    image: require('../../assets/properties/rosebank-loft.png'),
    description: 'Sunlit loft with a calm city outlook, generous living space and an easy Rosebank base.',
    checkInTime: '15:00', automationEnabled: true,
  },
  {
    id: 'sandton-studio', name: 'Sandton Studio', area: 'Sandton, Johannesburg', status: 'Ready',
    occupancy: 'Vacant and prepared', nextStay: 'Michael checks in today at 16:00',
    syncHealth: 'Attention', syncLabel: 'Guest message sync needs retry', accent: '#CAD8E4', icon: 'bed-outline',
    listingStatus: 'Active on connected channel',
    activeWorkflows: ['Arrival reminder', 'Checkout reminder'],
    baseNotes: ['Cleaner completed turnover at 12:08', 'Wi-Fi guide updated yesterday'],
    image: require('../../assets/properties/sandton-studio.png'),
    description: 'Polished studio designed for effortless city stays, with soft light and a dedicated work nook.',
    checkInTime: '16:00', automationEnabled: true,
  },
];

export const bookings: Booking[] = [
  { id: 'sarah', guest: 'Sarah Mitchell', initials: 'SM', propertyId: 'sandton-studio', dates: '12 Sep → 15 Sep', nights: 3, value: 'R4,350', status: 'Confirmed', checkIn: '12 September · 15:00', checkOut: '15 September · 10:00', guests: 2, note: 'Early check-in requested. No scheduling conflicts detected.' },
  { id: 'michael', guest: 'Michael Chen', initials: 'MC', propertyId: 'rosebank-loft', dates: '9 Sep → 12 Sep', nights: 3, value: 'R5,100', status: 'In house', checkIn: '9 September · 14:00', checkOut: '12 September · 10:00', guests: 2, note: 'Cleaning scheduled for 11:30 after checkout.' },
  { id: 'naledi', guest: 'Naledi Mokoena', initials: 'NM', propertyId: 'rosebank-loft', dates: '18 Aug → 21 Aug', nights: 3, value: 'R4,800', status: 'Completed', checkIn: '18 August · 15:00', checkOut: '21 August · 10:00', guests: 1, note: 'Stay completed with a five-star review.' },
];

export const conversations: Conversation[] = [
  { id: 'sarah', bookingId: 'sarah', guest: 'Sarah Mitchell', propertyId: 'sandton-studio', preview: 'Hi! Would it be possible to check in earlier?', time: '10:42', unread: true, messages: [
    { id: 's1', author: 'host', text: 'Hi Sarah, we are looking forward to hosting you.', time: '09:18' },
    { id: 's2', author: 'guest', text: 'Hi! Would it be possible to check in earlier?', time: '10:42' },
  ] },
  { id: 'michael', bookingId: 'michael', guest: 'Michael Chen', propertyId: 'rosebank-loft', preview: 'Thank you, everything is perfect.', time: 'Yesterday', unread: false, messages: [
    { id: 'm1', author: 'host', text: 'Your check-in details have been sent. Let me know if you need anything.', time: '14:02' },
    { id: 'm2', author: 'guest', text: 'Thank you, everything is perfect.', time: '18:31' },
  ] },
];

export const reviews: Review[] = [
  { id: 'review-1', propertyId: 'rosebank-loft', reviewer: 'Thandi', date: '5 Sep 2026', rating: 5, excerpt: 'Beautiful space, spotless on arrival and the check-in notes were exceptionally clear.', responseStatus: 'Needs reply', source: 'Sample Airbnb data' },
  { id: 'review-2', propertyId: 'sandton-studio', reviewer: 'Luca', date: '29 Aug 2026', rating: 4.8, excerpt: 'A quiet, thoughtfully designed stay close to everything I needed in Sandton.', responseStatus: 'Replied', source: 'Sample Airbnb data' },
  { id: 'review-3', propertyId: 'rosebank-loft', reviewer: 'Ayesha', date: '18 Aug 2026', rating: 4.9, excerpt: 'The loft feels even better than the photos. Fast, considerate communication throughout.', responseStatus: 'Replied', source: 'Sample Airbnb data' },
];

export const initialTasks: HostTask[] = [
  { id: 'task-1', title: 'Turnover clean and linen check', propertyId: 'rosebank-loft', due: 'Today, 11:00', assignee: 'Lindiwe', status: 'open', overdue: true, category: 'Cleaning' },
  { id: 'task-2', title: 'Inspect bathroom tap', propertyId: 'sandton-studio', due: 'Today, 15:30', assignee: 'Sipho', status: 'open', category: 'Maintenance' },
];

export const initialApproval: Approval = {
  id: 'approval-1', propertyId: 'rosebank-loft', field: 'Cover photo',
  before: 'Interior living room', after: 'Balcony at golden hour',
  requestedBy: 'WhatsApp conversation', expires: 'Today at 18:00', status: 'pending',
};

export const initialActivity: Activity[] = [
  { id: 'act-1', kind: 'user', title: 'Listing change requested', detail: 'You asked VirtuHost to update the Rosebank Loft cover photo.', time: '14:22' },
  { id: 'act-2', kind: 'automation', title: 'Arrival message prepared', detail: 'Standard arrival instructions are ready for Michael.', time: '13:40' },
  { id: 'act-3', kind: 'sync', title: 'Reservation sync complete', detail: 'Two properties checked against the connected booking channel.', time: '12:55' },
  { id: 'act-4', kind: 'failure', title: 'Guest message not synced', detail: 'Sandton Studio needs a safe retry. No duplicate message was sent.', time: '12:31', retryable: true },
];

export const timelineEvents: TimelineEvent[] = [
  { id: 'event-1', time: '10:00', propertyId: 'rosebank-loft', title: 'Checkout', detail: 'Guest departure', kind: 'checkout' },
  { id: 'event-2', time: '11:00', propertyId: 'rosebank-loft', title: 'Cleaning', detail: 'Turnover clean with Lindiwe', kind: 'task', taskId: 'task-1' },
  { id: 'event-3', time: '15:00', propertyId: 'rosebank-loft', title: 'Arrival', detail: 'Naledi checks in', kind: 'arrival' },
  { id: 'event-4', time: '16:00', propertyId: 'sandton-studio', title: 'Arrival', detail: 'Michael checks in', kind: 'arrival' },
];
