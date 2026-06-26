# Divine Panchang: Interactive Feature Specifications

These features are designed to increase "Time on Site" and "Pages per Session," which are the most important user-behavior signals for Google ranking.

## 1. Daily Tarot Module (Interactive)

### Concept
A visual "Pick a Card" experience that feels premium and sacred. Unlike technical Vedic charts, Tarot is instantly accessible to everyone.

### Requirements
*   **The Deck:** 78 Rider-Waite or Custom "Vedic-Themed" Tarot cards.
*   **User Flow:**
    1.  User centers themselves (Om animation).
    2.  Selects 1 card (Daily Guidance) or 3 cards (Past/Present/Future).
    3.  Card flips with a smooth animation.
    4.  Interpretation is displayed with a "Share on Instagram" button.
*   **Placement:** Prominently on the Homepage and as a separate `/tarot` landing page.

---

## 2. Personalized User Dashboard ("My Divine Space")

### Concept
A logged-in experience that saves birth details (Janam Kundli) and provides real-time personalized alerts.

### Requirements
*   **Saved Profiles:** Allow users to save 5+ profiles (Self, Family, Partners).
*   **Dynamic Guidance:** 
    *   "Today is your **Sade Sati Peak** phase—avoid major investments."
    *   "Your **Jupiter Dasha** is starting—excellent for spiritual growth."
*   **Alerts:** "Rahu Kaal starts in 15 minutes for your location (Bengaluru)."
*   **Retention:** Send a weekly "Your Personalized Forecast" email.

---

## 3. Spiritual Community (Forum or Q&A)

### Concept
A place for users to ask questions and get community or AI-Guru answers.

### Requirements
*   **The "Vedic Q&A":** Searchable database of questions (e.g., "Why is my 7th house empty?").
*   **SEO Benefit:** Every user question creates a new long-tail keyword landing page for Google to index.

---

## 4. Technical Integration Notes (for Developers)
*   **Framework:** Use the existing Next.js/React stack.
*   **State Management:** Use `localStorage` for guest profiles and a Backend (Supabase/Firebase) for logged-in users.
*   **Animations:** Use `Framer Motion` for card flips and Om-chant visuals.
