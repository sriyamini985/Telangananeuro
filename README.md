# Telangana Neurosciences Society (TNS) — Official Association Website

Standalone full-stack React + Vite + Tailwind CSS + Three.js association platform built for the **Telangana Neurosciences Society**.

## Design System & Brand Tokens

Derived directly from the official Telangana Neurosciences Society crest (`src/assets/images/tns-logo.png`):

- **Primary (Society Purple)**: `#393185` (`--tns-primary`)
- **Secondary (Neuroscience Lime)**: `#B0CB1F` (`--tns-lime`)
- **Accent (Heritage Gold)**: `#C18C26` (`--tns-gold`)
- **Supporting (Neural Cyan)**: `#009DE2` (`--tns-cyan`)
- **Universal Warm Ivory Ground**: `#F7F2E8` (`--tns-background`), `#F1EADB` (`--tns-background-soft`), `#FBF8F1` (`--tns-surface`)

## 3D Human Brain Hero (`src/components/BrainScene.jsx`)

- Interactive Three.js 3D anatomical human brain rendered on the right side of the hero section (left/right cerebral hemispheres with cortical gyri/sulci folding, cerebellum with folia, brainstem, and subtle purple/gold/cyan neural connection accents).
- **Optional External GLB Asset Integration Point**: Drop a licensed anatomical GLB model at `public/models/human-brain.glb` and the scene will automatically load and calibrate it instead of the procedural mesh.
- Respects `prefers-reduced-motion`, supports drag-to-orbit, and provides a WebGL fallback (`src/assets/images/brain_fallback.jpg`).

## Running Locally

### Frontend
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Backend API (Optional, for Membership, Contact, & Admin Persistence)
```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Content & Assets Pending Secretariat Confirmation

Editable placeholders are marked in `src/data/tnsData.js`:
1. Official TNS society founding year / registration number (`societyInfo.historyNote`).
2. Membership fee amounts for Life Member & Associate / Trainee Member (`membershipData.categories`).
3. Individual portrait photographs for Executive Committee members (`committeeData.officeBearers`).
4. Past conferences, CME calendar dates, and society gallery photographs (`eventsData`, `galleryItems`).
5. Optional high-detail anatomical `.glb` 3D brain asset at `public/models/human-brain.glb`.
