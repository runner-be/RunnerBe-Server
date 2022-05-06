## ✨ERD

[aquerytool 링크](https://aquerytool.com/aquerymain/index/?rurl=e5d20677-5c8a-4c70-a285-85b0c89572bd&)

Password : a2ia76

[원본 이미지](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e5e91b30-9a64-4c72-b022-872d099e8f8f/RunnerBe_20220504_135545.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220506%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220506T122222Z&X-Amz-Expires=86400&X-Amz-Signature=6ef1edd2a2cf82c757d600dc6abc2670dad994104d030b8fd54155fe0d2ea1fc&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22RunnerBe_20220504_135545.png%22&x-id=GetObject)

## 💻API Specification

[API 명세서 링크](https://documenter.getpostman.com/view/16676621/UyxbrA2D)

## 📁Structure

앞에 (\*)이 붙어있는 파일(or 폴더)은 추가적인 과정 이후에 생성된다.

```
├── config
│ ├── baseResponseStatus.js
│ ├── database.js
│ ├── express.js
│ ├── jwtMiddleware.js
│ ├── secret.js
│ ├── winston.js
├── * log
├── * node_modules
├── src
│ ├── app
│ │ ├── User
│ │ │ ├── userDao.js
│ │ │ ├── userController.js
│ │ │ ├── userProvider.js
│ │ │ ├── userService.js
│ │ │ ├── userRoute.js
│ │ ├── Running
│ │ │ ├── runningDao.js
│ │ │ ├── runningController.js
│ │ │ ├── runningProvider.js
│ │ │ ├── runningService.js
│ │ │ ├── runningRoute.js
│ │ ├── Posting
│ │ │ ├── postingDao.js
│ │ │ ├── postingController.js
│ │ │ ├── postingProvider.js
│ │ │ ├── postingService.js
│ │ │ ├── postingRoute.js
│ │ ├── Message
│ │ │ ├── messageDao.js
│ │ │ ├── messageController.js
│ │ │ ├── messageProvider.js
│ │ │ ├── messageService.js
│ │ │ ├── messageRoute.js

├── .gitignore
├── index.js
├── * package-lock.json
├── package.json
└── README.md
```

## ✨License

MIT License
