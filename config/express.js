const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
var cors = require("cors");
module.exports = function () {
  const app = express();

  //웹서버가 웹브라우저에게 응답할 때 그 데이터를 압축(gzip 방식)하는 미들웨어 담당!
  app.use(compression());

  // http 요청 메시지 형식에서 body데이터(json 형태의 데이터)를 해석
  app.use(express.json());

  // http 요청 메시지 형식에서 body데이터(x-www-form-urlencoded형태의 데이터)를 해석
  app.use(express.urlencoded({ extended: true })); // extended 옵션 - true : qs모듈을 사용(추가 설치) , false는 내장된 querystring모듈을 사용

  //GET이나 POST을 PUT 또는 DELETE으로 매핑시켜주는 도구, html은 put, delete를 지원하지 않음
  app.use(methodOverride());

  /**
   * CORS란 자신이 속하지 않은 다른 도메인, 다른 프로토콜,
   * 혹은 다른 포트에 있는 리소스를 요청하는 cross-origin HTTP 요청 방식
   * 기본적으로 이러한 cors를 제한하지만, node.js에서 다음과 같이 허용 가능
   * app.use(cors())를 하게 되면 모든 도메인에서 제한 없이 해당 서버에 요청을 보내고 응답을 받을 수 있다.
   * +> corsOptions 변수에 자신이 허용할 도메인을 추가하고 app.use(cors(corsOptions))를 하게 되면
   *    해당 도메인은 제한 없이 해당 서버에 요청을 보내고 응답을 받을 수 있다.
   */
  app.use(cors());
  // app.use(express.static(process.cwd() + '/public'));

  /* App (Android, iOS) */
  require("../src/app/User/userRoute")(app);
  require("../src/app/Posting/postingRoute")(app);
  require("../src/app/Message/messageRoute")(app);
  require("../src/app/Running/runningRoute")(app);

  return app;
};
