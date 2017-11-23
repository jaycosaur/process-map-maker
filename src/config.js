export default {
  MAX_ATTACHMENT_SIZE: 5000,
  s3: {
    BUCKET: "processmap-app-uploads"
  },
  apiGateway: {
    URL: "https://mwrjn1x37b.execute-api.ap-southeast-2.amazonaws.com/prod",
    REGION: "ap-southeast-2"
  },
  cognito: {
    USER_POOL_ID: "ap-southeast-2_rXLtB5MFS",
    APP_CLIENT_ID: "7a3octqha9ulvgo12nhbsc1ncs",
    REGION: "ap-southeast-2",
    IDENTITY_POOL_ID: "ap-southeast-2:6a1c168a-a56f-4b6a-b369-281e615f6018"
  }
};