// The three in-page forms. `required: true` shows the red asterisk and blocks sending until filled.
// worker/src/index.ts keeps the same required list per form, so the server checks too.
import type { Field, FormSpec } from '../lib/forms';
import { PRODUCTS } from './products';

const contact: Field[] = [
  { kind: 'text', name: 'name', label: 'Your name', required: true, autocomplete: 'name', maxLength: 80 },
  { kind: 'email', name: 'email', label: 'Email', required: true, autocomplete: 'email', maxLength: 120, help: 'I’ll reply here.' },
];

export const MAKE: FormSpec = {
  type: 'make',
  sections: [
    { title: 'Your contact details', fields: contact },
    {
      title: 'The project',
      fields: [
        { kind: 'text', name: 'title', label: 'What is it?', required: true, maxLength: 120, placeholder: 'e.g. Replacement drawer handle' },
        { kind: 'textarea', name: 'description', label: 'Overall description', required: true, rows: 6, help: 'Be as specific as you can, and include every dimension or number you know — sizes, hole spacing, thickness, how many you need, the weight it has to hold.' },
      ],
    },
    {
      title: 'Limits and preferences',
      fields: [
        { kind: 'textarea', name: 'limits', label: 'Limitations and restrictions', rows: 4, help: 'Anything the design has to work within: space it must fit, parts it must clear or attach to, maximum size or weight, heat, outdoor use, budget.' },
        { kind: 'textarea', name: 'preferences', label: 'Colour, material and other preferences', rows: 3, help: 'Colours, material (e.g. PLA, PETG, flexible), finish, or anything else you’d like or need.' },
        { kind: 'text', name: 'deadline', label: 'Preferred deadline', maxLength: 80, placeholder: 'e.g. by November 20, within a month, no rush' },
      ],
    },
    { title: 'Images and files', fields: [{ kind: 'files', name: 'files', label: 'Photos, sketches or model files', help: 'A photo with a ruler or coin for scale helps a lot.' }] },
  ],
  submitLabel: 'Send my project',
  thanks: {
    title: 'Got it — thanks!',
    body: 'Your project is on my desk. I’ll look it over and reply by email.',
    another: 'Start another project',
  },
};

export const SOLVE: FormSpec = {
  type: 'solve',
  sections: [
    { title: 'Your contact details', fields: contact },
    {
      title: 'The problem',
      fields: [
        { kind: 'textarea', name: 'problem', label: 'What problem are you trying to solve?', required: true, rows: 4, help: 'What’s broken, missing or in the way?' },
        { kind: 'textarea', name: 'purpose', label: 'What should the finished part do?', required: true, rows: 4, help: 'Describe the job it needs to do, not the shape — we’ll work that out together.' },
        { kind: 'textarea', name: 'use', label: 'Where and how will it be used?', required: true, rows: 3, help: 'Indoors or outside, heat, weight it holds, how often it’s handled…' },
      ],
    },
    {
      title: 'Limits and preferences',
      fields: [
        { kind: 'textarea', name: 'limits', label: 'Limitations and restrictions', rows: 4, help: 'Anything it has to work within: roughly how much space it has, what it must clear or attach to, weight it holds, heat, outdoor use. Rough is fine.' },
        { kind: 'textarea', name: 'preferences', label: 'Colour, material and other preferences', rows: 3, help: 'Colours, material (e.g. PLA, PETG, flexible), looks, or anything else you’d like or need.' },
        { kind: 'textarea', name: 'tried', label: 'What have you tried so far?', rows: 3 },
        { kind: 'select', name: 'budget', label: 'Budget', options: ['Under $25', '$25–$50', '$50–$100', '$100+'], placeholder: 'Not sure yet' },
        { kind: 'text', name: 'deadline', label: 'Preferred deadline', maxLength: 80, placeholder: 'e.g. by November 20, within a month, no rush' },
      ],
    },
    { title: 'Photos', fields: [{ kind: 'files', name: 'files', label: 'Photos of the problem or the space', help: 'Show me what you’re dealing with — a few angles help.' }] },
  ],
  submitLabel: 'Send my problem',
  thanks: {
    title: 'Thanks — let’s figure it out.',
    body: 'I’ll read through it, sketch a few ideas and email you to talk them over.',
    another: 'Start another project',
  },
};

// Gallery order request. The product, colour and price are added by the gallery (mountForm's `extra`).
export const ORDER: FormSpec = {
  type: 'order',
  sections: [
    { title: 'Your contact details', fields: contact },
    {
      title: 'Your order',
      fields: [
        { kind: 'number', name: 'quantity', label: 'How many?', required: true, min: 1, max: 20, value: 1 },
        { kind: 'textarea', name: 'notes', label: 'Questions or special requests', rows: 3, help: 'A different colour, a custom size, a name added, or anything you’d like to ask.' },
      ],
    },
  ],
  submitLabel: 'Send my order request',
  thanks: {
    title: 'Order request sent!',
    body: 'Nothing has been charged. I’ll email you to confirm the details, the total and how to pay.',
    another: 'Start a new order',
  },
};

export const REVIEW: FormSpec = {
  type: 'review',
  sections: [
    {
      title: 'About you',
      fields: [
        { kind: 'text', name: 'name', label: 'Your name', required: true, autocomplete: 'name', maxLength: 40, help: 'Shown with your review, e.g. “Priya S.”' },
        { kind: 'email', name: 'email', label: 'Email', required: true, autocomplete: 'email', maxLength: 120, help: 'Never shown. Only used if I need to follow up.' },
      ],
    },
    {
      title: 'Your review',
      fields: [
        { kind: 'select', name: 'product', label: 'What did you buy?', required: true, options: [...PRODUCTS.map(p => p.name), 'Custom order', 'Something else'], placeholder: 'Pick one' },
        { kind: 'rating', name: 'rating', label: 'Your rating', required: true },
        { kind: 'textarea', name: 'comment', label: 'Your review', required: true, rows: 4, maxLength: 400, help: 'What did you like? What could be better?' },
      ],
    },
  ],
  submitLabel: 'Post my review',
  thanks: {
    title: 'Thanks for the review!',
    body: 'I read every review before it goes up, so it’ll appear on this board once I’ve approved it.',
    another: 'Leave another review',
  },
};
