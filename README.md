## 📁Structure

```
RunnerBe-Server
├─ .github
│  ├─ ISSUE_TEMPLATE
│  │  ├─ api-template.md
│  │  ├─ bug_report.md
│  │  └─ feature_request.md
│  └─ workflows
│     └─ node.js.yml
├─ .gitignore
├─ config
│  ├─ baseResponseStatus.js
│  ├─ database.js
│  ├─ express.js
│  ├─ jwtMiddleware.js
│  ├─ response.js
│  └─ winston.js
├─ package-lock.json
├─ package.json
├─ LICENSE
├─ README.md
├─ ecosystem.config.js
├─ index.js
├─ log
├─ node_modules
└─ src
   └─ app
      ├─ Admin
      ├─ Controller
      │  ├─ messageController.js
      │  ├─ postingController.js
      │  ├─ runningController.js
      │  └─ userController.js
      ├─ Dao
      │  ├─ messageDao.js
      │  ├─ postingDao.js
      │  ├─ runningDao.js
      │  └─ userDao.js
      ├─ Provider
      │  ├─ messageProvider.js
      │  ├─ postingProvider.js
      │  ├─ runningProvider.js
      │  └─ userProvider.js
      ├─ Route
      │  ├─ messageRoute.js
      │  ├─ postingRoute.js
      │  ├─ runningRoute.js
      │  └─ userRoute.js
      └─ Service
         ├─ messageService.js
         ├─ postingService.js
         ├─ runningService.js
         └─ userService.js

```

## 💻API Specification

[API 명세서 링크](https://documenter.getpostman.com/view/16676621/UyxbrA2D)

## ✨ERD

[aquerytool 링크](https://aquerytool.com/aquerymain/index/?rurl=e5d20677-5c8a-4c70-a285-85b0c89572bd&)

Password : a2ia76

[원본 이미지](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e5e91b30-9a64-4c72-b022-872d099e8f8f/RunnerBe_20220504_135545.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220506%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220506T122222Z&X-Amz-Expires=86400&X-Amz-Signature=6ef1edd2a2cf82c757d600dc6abc2670dad994104d030b8fd54155fe0d2ea1fc&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22RunnerBe_20220504_135545.png%22&x-id=GetObject)

## ✨License

MS-RL License
