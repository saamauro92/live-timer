# Storyblok Homepage Setup Guide

## Overview
This guide provides exact field configurations for setting up the homepage in Storyblok CMS.

---

## Component Field Definitions

### 1. Enhanced Hero Block (`block/hero`)

**Component Name**: `block/hero`

**Fields**:
```
- title (Text) - Required
  Label: "Title"
  Validation: Required, Max 100 characters

- subtitle (Text) - Optional
  Label: "Subtitle"
  Validation: Max 150 characters

- description (Textarea) - Optional
  Label: "Description"
  Validation: Max 500 characters

- cta_text (Text) - Optional
  Label: "Primary CTA Text"
  Default: "Get Started Free"

- cta_link (Link) - Optional
  Label: "Primary CTA Link"
  Allowed types: Story, URL

- cta_secondary_text (Text) - Optional
  Label: "Secondary CTA Text"

- cta_secondary_link (Link) - Optional
  Label: "Secondary CTA Link"
  Allowed types: Story, URL

- image (Asset) - Optional
  Label: "Hero Image"
  Allowed types: Images only

- background_color (Text) - Optional
  Label: "Background Color"
  Options: 
    - gradient-blue-indigo
    - white
    - dark
    - custom
  Default: gradient-blue-indigo

- custom_background_color (Color) - Optional
  Label: "Custom Background Color"
  Show only if: background_color = "custom"

- alignment (Option) - Optional
  Label: "Content Alignment"
  Options: left, center, right
  Default: center
```

---

### 2. Enhanced Feature Block (`block/feature`)

**Component Name**: `block/feature`

**Fields**:
```
- title (Text) - Required
  Label: "Section Title"
  Validation: Required, Max 100 characters

- description (Textarea) - Optional
  Label: "Section Description"
  Validation: Max 300 characters

- features (Blocks) - Required
  Label: "Features List"
  Allowed components: [block/feature-item]
  Minimum: 1
  Maximum: 12

- layout (Option) - Optional
  Label: "Layout Style"
  Options: grid-3, grid-2, list
  Default: grid-3

- background_color (Text) - Optional
  Label: "Background Color"
  Options: white, gray, dark
  Default: white
```

**Nested Component: `block/feature-item`**

**Fields**:
```
- title (Text) - Required
  Label: "Feature Title"
  Validation: Required, Max 80 characters

- description (Textarea) - Required
  Label: "Feature Description"
  Validation: Required, Max 200 characters

- icon (Asset) - Optional
  Label: "Icon"
  Allowed types: Images only
  Recommended size: 48x48px or SVG

- icon_color (Color) - Optional
  Label: "Icon Background Color"
  Default: #3B82F6 (blue-500)
```

---

### 3. Steps Block (`block/steps`)

**Component Name**: `block/steps`

**Fields**:
```
- title (Text) - Required
  Label: "Section Title"
  Default: "Get Started in 3 Simple Steps"

- description (Textarea) - Optional
  Label: "Section Description"

- steps (Blocks) - Required
  Label: "Steps"
  Allowed components: [block/step-item]
  Minimum: 1
  Maximum: 6

- layout (Option) - Optional
  Label: "Layout"
  Options: horizontal, vertical
  Default: horizontal

- show_numbers (Boolean) - Optional
  Label: "Show Step Numbers"
  Default: true
```

**Nested Component: `block/step-item`**

**Fields**:
```
- step_number (Number) - Optional
  Label: "Step Number"
  Default: Auto-increment

- title (Text) - Required
  Label: "Step Title"
  Validation: Required, Max 80 characters

- description (Textarea) - Required
  Label: "Step Description"
  Validation: Required, Max 200 characters

- icon (Asset) - Optional
  Label: "Step Icon"
  Allowed types: Images only

- image (Asset) - Optional
  Label: "Step Image/Illustration"
  Allowed types: Images only
```

---

### 4. Use Cases Block (`block/use-cases`)

**Component Name**: `block/use-cases`

**Fields**:
```
- title (Text) - Required
  Label: "Section Title"
  Default: "Trusted Across Industries"

- description (Textarea) - Optional
  Label: "Section Description"

- use_cases (Blocks) - Required
  Label: "Use Cases"
  Allowed components: [block/use-case-item]
  Minimum: 1
  Maximum: 12

- layout (Option) - Optional
  Label: "Layout"
  Options: grid-3, grid-2, grid-4
  Default: grid-3
```

**Nested Component: `block/use-case-item`**

**Fields**:
```
- title (Text) - Required
  Label: "Use Case Title"
  Validation: Required, Max 80 characters

- description (Textarea) - Required
  Label: "Use Case Description"
  Validation: Required, Max 200 characters

- icon (Asset) - Optional
  Label: "Icon"
  Allowed types: Images only

- image (Asset) - Optional
  Label: "Use Case Image"
  Allowed types: Images only

- link (Link) - Optional
  Label: "Learn More Link"
  Allowed types: Story, URL
```

---

### 5. Testimonials Block (`block/testimonials`)

**Component Name**: `block/testimonials`

**Fields**:
```
- title (Text) - Required
  Label: "Section Title"
  Default: "Trusted by Event Professionals Worldwide"

- description (Textarea) - Optional
  Label: "Section Description"

- testimonials (Blocks) - Required
  Label: "Testimonials"
  Allowed components: [block/testimonial-item]
  Minimum: 1
  Maximum: 20

- layout (Option) - Optional
  Label: "Layout"
  Options: carousel, grid-3, grid-2
  Default: carousel

- show_ratings (Boolean) - Optional
  Label: "Show Star Ratings"
  Default: true

- autoplay (Boolean) - Optional
  Label: "Auto-play Carousel"
  Default: true
  Show only if: layout = "carousel"

- autoplay_interval (Number) - Optional
  Label: "Auto-play Interval (seconds)"
  Default: 5
  Show only if: autoplay = true
```

**Nested Component: `block/testimonial-item`**

**Fields**:
```
- quote (Textarea) - Required
  Label: "Testimonial Quote"
  Validation: Required, Max 500 characters

- name (Text) - Required
  Label: "Name"
  Validation: Required, Max 100 characters

- role (Text) - Optional
  Label: "Job Title/Role"
  Validation: Max 100 characters

- company (Text) - Optional
  Label: "Company/Organization"
  Validation: Max 100 characters

- image (Asset) - Optional
  Label: "Profile Image"
  Allowed types: Images only
  Recommended size: 80x80px

- rating (Number) - Optional
  Label: "Rating (1-5)"
  Validation: Min 1, Max 5
  Default: 5

- featured (Boolean) - Optional
  Label: "Featured Testimonial"
  Default: false
```

---

### 6. Stats Block (`block/stats`)

**Component Name**: `block/stats`

**Fields**:
```
- title (Text) - Optional
  Label: "Section Title"
  Default: "Built for Scale"

- description (Textarea) - Optional
  Label: "Section Description"

- stats (Blocks) - Required
  Label: "Statistics"
  Allowed components: [block/stat-item]
  Minimum: 1
  Maximum: 8

- layout (Option) - Optional
  Label: "Layout"
  Options: grid-4, grid-3, grid-2
  Default: grid-4

- background_color (Text) - Optional
  Label: "Background Color"
  Options: white, gray, dark, gradient
  Default: gray
```

**Nested Component: `block/stat-item`**

**Fields**:
```
- value (Text) - Required
  Label: "Stat Value"
  Validation: Required, Max 50 characters
  Example: "99.9%", "10,000+", "50,000+"

- label (Text) - Required
  Label: "Stat Label"
  Validation: Required, Max 100 characters
  Example: "Uptime", "Events Timed", "Concurrent Viewers"

- description (Textarea) - Optional
  Label: "Stat Description"
  Validation: Max 150 characters

- icon (Asset) - Optional
  Label: "Icon"
  Allowed types: Images only

- highlight (Boolean) - Optional
  Label: "Highlight This Stat"
  Default: false
```

---

### 7. FAQ Block (`block/faq`)

**Component Name**: `block/faq`

**Fields**:
```
- title (Text) - Required
  Label: "Section Title"
  Default: "Frequently Asked Questions"

- description (Textarea) - Optional
  Label: "Section Description"

- faqs (Blocks) - Required
  Label: "FAQ Items"
  Allowed components: [block/faq-item]
  Minimum: 1
  Maximum: 30

- layout (Option) - Optional
  Label: "Layout"
  Options: accordion, list
  Default: accordion

- allow_multiple_open (Boolean) - Optional
  Label: "Allow Multiple FAQs Open"
  Default: false
  Show only if: layout = "accordion"
```

**Nested Component: `block/faq-item`**

**Fields**:
```
- question (Text) - Required
  Label: "Question"
  Validation: Required, Max 200 characters

- answer (Textarea) - Required
  Label: "Answer"
  Validation: Required, Max 1000 characters

- category (Text) - Optional
  Label: "Category"
  Validation: Max 50 characters
  Help text: "Optional: Group FAQs by category (e.g., 'Pricing', 'Features')"

- featured (Boolean) - Optional
  Label: "Featured FAQ"
  Default: false
  Help text: "Featured FAQs appear at the top"
```

---

## Page Module Configuration

### Page Component (`modules/page`)

**Fields** (add if not already present):
```
- title (Text) - Required
  Label: "Page Title"
  Used for: Internal reference

- seo_title (Text) - Optional
  Label: "SEO Title"
  Validation: Max 60 characters
  Help text: "Recommended: 50-60 characters"

- seo_description (Textarea) - Optional
  Label: "SEO Description"
  Validation: Max 160 characters
  Help text: "Recommended: 150-160 characters"

- seo_keywords (Text) - Optional
  Label: "SEO Keywords"
  Validation: Max 200 characters
  Help text: "Comma-separated keywords"

- og_image (Asset) - Optional
  Label: "Open Graph Image"
  Allowed types: Images only
  Recommended size: 1200x630px

- body (Blocks) - Required
  Label: "Page Content"
  Allowed components: 
    - block/hero
    - block/feature
    - block/steps
    - block/use-cases
    - block/testimonials
    - block/stats
    - block/faq
    - content/text
```

---

## Storyblok Space Setup Steps

### Step 1: Create Components

1. Go to **Components** in Storyblok
2. Create each component listed above
3. Add fields as specified
4. Set up nested components (feature-item, step-item, etc.)

### Step 2: Create Homepage Story

1. Go to **Content** → **Stories**
2. Create new story:
   - **Name**: "Homepage"
   - **Slug**: `home`
   - **Component**: `modules/page`
3. Fill in SEO fields:
   - **SEO Title**: "LiveTimer - Real-Time Countdown Timer for Professional Events"
   - **SEO Description**: "Keep your events on track with synchronized countdown timers. Real-time updates, shareable links, professional dashboard. Free tier available."
   - **SEO Keywords**: "countdown timer, event timer, real-time timer, presentation timer, conference timer, livestream timer"

### Step 3: Add Content Blocks

Add blocks to the `body` field in this order:

1. **Hero Block** (`block/hero`)
   - Use primary variation content from content plan

2. **Feature Block** (`block/feature`)
   - Add 6 feature items (Real-Time Sync, Multiple Timers, etc.)

3. **Steps Block** (`block/steps`)
   - Add 3 step items (Create Room, Share Link, Control & Monitor)

4. **Use Cases Block** (`block/use-cases`)
   - Add 6 use case items

5. **Feature Block** (`block/feature`) - Benefits
   - Add 6 benefit items (No Downloads, Real-Time, etc.)

6. **Testimonials Block** (`block/testimonials`)
   - Add 3-4 testimonial items

7. **Stats Block** (`block/stats`)
   - Add 4 stat items

8. **FAQ Block** (`block/faq`)
   - Add 8 FAQ items

9. **Hero Block** (`block/hero`) - Final CTA
   - Use simplified CTA variation

### Step 4: Configure Visual Editor

1. Set up **Visual Editor** for live preview
2. Configure **Preview URL** to point to your Nuxt app
3. Test all components render correctly

### Step 5: Publish

1. Review all content
2. Check SEO fields
3. Preview in Visual Editor
4. **Publish** the story

---

## Content Import Template (CSV/JSON)

For bulk content creation, you can use this structure:

### Features CSV Template
```csv
title,description,icon
Real-Time Synchronization,"All viewers see timer updates instantly. No refresh needed. Powered by Socket.IO for reliable, low-latency updates across unlimited devices.",icon-sync.svg
Multiple Timers Per Room,"Create an entire event rundown with multiple timers. Switch between timers seamlessly or run them in sequence. Perfect for complex event schedules.",icon-timers.svg
```

### Testimonials CSV Template
```csv
quote,name,role,company,rating
"LiveTimer saved our conference. We had 20+ speakers and everything ran perfectly on time. The real-time sync is flawless.",Sarah Chen,Event Director,TechCon Events,5
```

---

## Component Presets

Create presets in Storyblok for common configurations:

### Preset 1: "Hero - Primary"
- Pre-filled with default hero content
- Background: gradient-blue-indigo
- Alignment: center

### Preset 2: "Hero - CTA Only"
- Simplified hero for final CTA section
- Minimal content, strong CTA

### Preset 3: "Features - 3 Column Grid"
- Layout: grid-3
- Background: white

### Preset 4: "Testimonials - Carousel"
- Layout: carousel
- Autoplay: true
- Show ratings: true

---

## Validation Rules

### Text Fields
- **Titles**: Max 100 characters
- **Subtitles**: Max 150 characters
- **Descriptions**: Max 500 characters
- **Short descriptions**: Max 200 characters

### Required Fields
- All section titles
- All feature/testimonial titles
- All FAQ questions and answers

### Image Requirements
- **Hero images**: Min 1200x600px, Max 5MB
- **Icons**: 48x48px or SVG, Max 100KB
- **Profile images**: 80x80px, Max 200KB
- **OG images**: 1200x630px, Max 1MB

---

## Multi-language Setup (Optional)

If you plan to support multiple languages:

1. Enable **Languages** in Storyblok settings
2. Add language variants for the homepage
3. Use **Translatable** field option for all text fields
4. Set up **Translatable slug** for SEO-friendly URLs

---

## A/B Testing Setup

To test different hero variations:

1. Create **Alternate Stories**:
   - Homepage - Variation A (Primary Hero)
   - Homepage - Variation B (Alternative Hero)
2. Use Storyblok's **Personalization** feature
3. Track conversions in your analytics
4. Set up redirects based on user segments

---

## Next Steps

1. ✅ Create all components in Storyblok
2. ✅ Set up nested components
3. ✅ Create homepage story
4. ✅ Add all content blocks
5. ✅ Configure SEO
6. ✅ Test in Visual Editor
7. ✅ Publish and verify on live site
8. ✅ Set up analytics tracking
9. ✅ Create alternate variations for A/B testing

---

**End of Setup Guide**

