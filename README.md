
# 🎬 **YouTube Clone – Full Video Streaming App (React + Redux + YouTube API)**

*A complete, production-level YouTube clone with full functionality, built using React, Redux Toolkit, and YouTube Data API v3.*

---

<div align="center">

## 🚀 **Live Demo Coming Soon**

### 📌 *A Fully Responsive, Fast & Feature-Rich YouTube Clone*

</div>

---

# 🏷️ Badges

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge\&logo=react)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-Latest-764ABC?style=for-the-badge\&logo=redux)
![YouTube API](https://img.shields.io/badge/YouTube%20Data%20API-v3-FF0000?style=for-the-badge\&logo=youtube)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Project%20Status-In%20Development-blue?style=for-the-badge)

</div>

---

# 📚 Table of Contents

1. [🎥 Project Overview](#-project-overview)
2. [✨ Features](#-features)
3. [🧩 Tech Stack](#-tech-stack)
4. [🔌 YouTube Data API Endpoints](#-youtube-data-api-endpoints)
5. [📁 Folder Structure](#-folder-structure)
6. [⚙️ Installation & Setup](#️-installation--setup)
7. [📸 Screenshots](#-screenshots)
8. [🛠 Future Enhancements](#-future-enhancements)
9. [🤝 Contributing](#-contributing)
10. [📜 License](#-license)

---

# 🎥 Project Overview

This is a fully functional **YouTube Clone** with all major YouTube functionalities including:

* Home feed
* Trending videos
* Watch video page
* Channel page
* Subscriptions
* Liked videos
* Watch history
* Watch later
* Search with suggestions
* Responsive layouts for mobile, tablet & desktop

Built using modern React concepts like reusable components, custom hooks, lazy loading, dynamic routing, global state with Redux Toolkit, and persistent storage using localStorage.

---

# ✨ Features

## 🏠 1. **Home Page**

* Trending & popular videos
* Category-wise filters
* Infinite scroll
* Responsive video grid
* Smooth UI with skeleton loaders

---

## 🔍 2. **Advanced Search**

* Live suggestions while typing
* Full search results page
* Search triggers video player page
* Stores search history (optional)

---

## ▶️ 3. **Video Player Page**

* YouTube iframe player
* Shows:

  * Title
  * Views
  * Likes
  * Published date
  * Channel info
* Related videos auto-shown
* Like / Unlike
* Save to Watch Later
* Automatically added to History

---

## 📺 4. **Channel Page**

* Subscribe / Unsubscribe
* Banner, logo, subscriber count
* Channel description
* Latest uploaded videos
* Full channel video list

---

## ❤️ 5. **Liked Videos**

* Add or remove likes
* Persisted in Redux + localStorage
* Dedicated Liked Videos page

---

## 🕒 6. **Watch History**

* Every watched video saved
* Timestamp included
* Remove one item / clear all
* Fully persistent

---

## 📌 7. **Watch Later**

* Save videos
* Remove anytime
* Full dedicated page

---

## 📚 8. **Sidebar Navigation**

Just like YouTube:

* Home
* Shorts
* Subscriptions
* Liked Videos
* Watch Later
* History
* Trending
* Categories

---

## 📱 9. **Fully Responsive**

Built with mobile-first design principles.

---

# 🧩 Tech Stack

| Area             | Technology                         |
| ---------------- | ---------------------------------- |
| Framework        | **React.js**                       |
| State Management | **Redux Toolkit**                  |
| Routing          | **React Router DOM**               |
| Styling          | CSS / Tailwind / MUI (your choice) |
| API              | **YouTube Data API v3**            |
| Storage          | **localStorage + Redux Persist**   |
| HTTP Requests    | Axios / fetch                      |

---

# 🔌 YouTube Data API Endpoints

## ✔ Get Trending Videos:

```
https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,statistics
  &chart=mostPopular
  &regionCode=US
  &maxResults=20
  &key=API_KEY
```

## ✔ Search Videos:

```
https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &q=SEARCH_QUERY
  &type=video
  &maxResults=20
  &key=API_KEY
```

## ✔ Video Details:

```
https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,contentDetails,statistics
  &id=VIDEO_ID
  &key=API_KEY
```

## ✔ Channel Info:

```
https://www.googleapis.com/youtube/v3/channels
  ?part=snippet,statistics
  &id=CHANNEL_ID
  &key=API_KEY
```

## ✔ Channel Uploads Playlist:

```
https://www.googleapis.com/youtube/v3/playlistItems
  ?part=snippet
  &playlistId=UPLOADS_PLAYLIST_ID
  &maxResults=50
  &key=API_KEY
```

---

# 📁 Folder Structure

```
src/
│── api/
│── assets/
│── components/
│── pages/
│   ├── Home/
│   ├── Watch/
│   ├── Channel/
│   ├── Liked/
│   ├── History/
│   ├── WatchLater/
│── redux/
│   ├── slices/
│   ├── store.js
│── hooks/
│── utils/
│── constants/
│── styles/
│── App.js
│── index.js
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Create Environment File

Create a `.env` file:

```
REACT_APP_YT_API_KEY=YOUR_API_KEY
```

## 4️⃣ Start the App

```bash
npm run dev
```

---


# 🛠 Future Enhancements

* Dark / Light theme
* User login & authentication
* Real subscriptions (backend)
* Video upload system
* Comment system
* Multi-language support
* Download video option (custom backend)

---

# 🤝 Contributing

Contributions, issues, and suggestions are welcome!
Feel free to fork this repo and open a PR.

---

# 📜 License

This project is licensed under the **MIT License**.

---
