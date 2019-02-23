// 入口網
const portal = (() => {
  // BASE
  const BASE = 'https://app.ntut.edu.tw/'
  // 登入頁面
  const INDEX_PAGE = BASE + 'index.do'
  // 登入驗證碼圖片
  const AUTH_IMAGE = BASE + 'authImage.do'
  // 登入
  const LOGIN = BASE + 'login.do'
  // 主頁面
  const MAIN_PAGE = BASE + 'myPortal.do'
  // 應用系統頁面
  const APTREE_LIST_PAGE = BASE + 'aptreeList.do'
  // 教務系統頁面
  const APTREE_AA_LIST_PAGE = APTREE_LIST_PAGE + '?apDn=ou=aa,ou=aproot,o=ldaproot'
  // SSO 登入課程系統
  const SSO_LOGIN_COURSE_SYSTEM = BASE
    + 'ssoIndex.do?apOu=aa_0010-&apUrl=https://aps.ntut.edu.tw/course/tw/courseSID.jsp'

  return {
    APTREE_AA_LIST_PAGE,
    APTREE_LIST_PAGE,
    AUTH_IMAGE,
    INDEX_PAGE,
    LOGIN,
    MAIN_PAGE,
    SSO_LOGIN_COURSE_SYSTEM,
  }
})()

const courseSystem = (() => {
  // BASE
  const BASE = 'https://aps.ntut.edu.tw/course/tw/'
  // 主頁面
  const MAIN_PAGE = BASE + 'courseSID.jsp'
  // 選課表？
  const SELECT = BASE + 'Select.jsp'

  return {
    MAIN_PAGE,
    SELECT,
  }
})()

export default {
  courseSystem,
  portal,
}
