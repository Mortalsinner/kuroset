
# 📦 Wardrobe & Outfit Planner App

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat&logo=supabase)](https://supabase.com/)

A highly stylized **Neo-Brutalist** wardrobe management platform built with **Next.js**, **Tailwind CSS**, and **Supabase**. Organize your clothing collection, create outfit combinations, share your style with others, and attach shopping links for every clothing item.

---

# ✨ Features

- 👕 **Wardrobe Tracker**
  - Add and manage clothing items.
  - Organize items by category:
    - Top
    - Bottom
    - Outer
    - Shoes
    - Accessories

- 🎨 **Outfit Builder**
  - Combine multiple wardrobe items into one outfit.
  - Save outfit names and styling notes.

- 🛍️ **Shopping Links**
  - Attach purchase links to every item.
  - Users can directly visit the store from an outfit.

- 🌎 **Explore Page**
  - Discover outfits shared publicly by other users.
  - Showcase your own public outfits.

- 🎭 **Neo-Brutalist Design**
  - High contrast UI
  - Thick borders
  - Retro shadows
  - Bold typography

---

# 🛠️ Tech Stack

- **Frontend**
  - Next.js 15
  - React
  - Tailwind CSS 4

- **Backend**
  - Supabase Authentication
  - Supabase Database
  - Supabase Storage

---

# 📋 Prerequisites

Before running the project locally, make sure you have:

- Node.js **v18+**
- npm / pnpm / yarn
- A Supabase project

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repository.git

cd your-repository
```

---

## 2. Install dependencies

Using npm

```bash
npm install
```

Using pnpm

```bash
pnpm install
```

Using yarn

```bash
yarn install
```

---

## 3. Setup environment variables

Create a file named:

```text
.env.local
```

Then add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

# 🗄️ Database Schema

## 1. items

Stores every clothing item.

```sql
CREATE TABLE items (
  id_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  shop_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

---

## 2. outfits

Stores saved outfit collections.

```sql
CREATE TABLE outfits (
  id_outfit UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

---

## 3. outfit_items

Many-to-many relationship between outfits and items.

```sql
CREATE TABLE outfit_items (
  id_outfit UUID REFERENCES outfits(id_outfit) ON DELETE CASCADE,
  id_item UUID REFERENCES items(id_item) ON DELETE CASCADE,
  PRIMARY KEY (id_outfit, id_item)
);
```

---

# 🖼️ Supabase Storage

Create a Storage Bucket named:

```text
wardrobe-images
```

Bucket settings:

- Public Bucket ✅
- Allow authenticated users to upload images
- Allow authenticated users to delete their own images

---

# ▶️ Running the Project

## Development

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## Production

```bash
npm run build
npm run start
```

---

# 📁 Project Structure

```text
├── app/
│   ├── explore/
│   │   └── page.tsx
│   ├── outfit/
│   │   └── [id]/
│   │       └── page.tsx
│   └── ...
│
├── components/
│   └── Alert.tsx
│
├── lib/
│   └── supabase.ts
│
├── public/
│
├── next.config.mjs
│
└── ...
```

---

# 🖼️ Next.js Image Configuration

Since images are hosted on Supabase Storage, register your storage domain inside **next.config.mjs**.

```javascript
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project-id.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

---

# 📌 Main Features

✅ User Authentication

✅ Wardrobe Management

✅ Outfit Builder

✅ Public Outfit Sharing

✅ Shopping Links

✅ Responsive Design

✅ Neo-Brutalist UI

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve this project:

1. Fork this repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

This project is available under the MIT License.

---

## 💙 Built With

- ⚡ Next.js
- 🎨 Tailwind CSS
- 🟢 Supabase
- ❤️ Neo-Brutalism Design
````
