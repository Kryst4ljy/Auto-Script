const axios = require("../lib/request");
const sendMail = require("../lib/mail");
const { JueJin_Domain } = require("../config/domain");

// const cookie =
//   "_ga=GA1.2.50751009.1606974420; odin_tt=342feeddd1f281c8a3c6afbaa5a94d136b98134fd5c1bbbe08f03f9285d01ba6ed061816268289abae638309c7179706c0e6129cf9d7039df229f3523094db34; n_mh=iBMi6NWY2kfUPou6RsOQtb6eAohK5ciLSIK5L8ik7bU; MONITOR_WEB_ID=20d2da37-7332-4cc3-b80c-3dc0ec7a4720; _tea_utm_cache_2608={%22utm_source%22:%22xitongxiaoxi1103%22%2C%22utm_medium%22:%22push%22%2C%22utm_campaign%22:%22gengwen_2021111%22}; passport_csrf_token_default=37dd6687e689eb353f4c6c338ea531f9; passport_csrf_token=37dd6687e689eb353f4c6c338ea531f9; _tea_utm_cache_2018=undefined; passport_auth_status=4a0eae598cc611cdda8d25408d394763%2C; passport_auth_status_ss=4a0eae598cc611cdda8d25408d394763%2C; _gid=GA1.2.1815801962.1638151894; sid_guard=d3ef3a98a9c2418b364085cb506b30a6%7C1638165410%7C5184000%7CFri%2C+28-Jan-2022+05%3A56%3A50+GMT; uid_tt=cc34506573fdc563e86debfb16bf5834; uid_tt_ss=cc34506573fdc563e86debfb16bf5834; sid_tt=d3ef3a98a9c2418b364085cb506b30a6; sessionid=d3ef3a98a9c2418b364085cb506b30a6; sessionid_ss=d3ef3a98a9c2418b364085cb506b30a6; sid_ucp_v1=1.0.0-KDgxNTBjNzcxMWUwYTM1Y2JhYTBkOGE5OTZkNWJiOTliNzZhOWY4ODgKFgjNodCg6fXjBBCi15GNBhiwFDgIQDgaAmxmIiBkM2VmM2E5OGE5YzI0MThiMzY0MDg1Y2I1MDZiMzBhNg; ssid_ucp_v1=1.0.0-KDgxNTBjNzcxMWUwYTM1Y2JhYTBkOGE5OTZkNWJiOTliNzZhOWY4ODgKFgjNodCg6fXjBBCi15GNBhiwFDgIQDgaAmxmIiBkM2VmM2E5OGE5YzI0MThiMzY0MDg1Y2I1MDZiMzBhNg";

const [cookie] = process.argv.slice(2);

const res = {
  status: 0, // 状态
  incr_point: 0, // 增加的矿石
  sum_point: 0, // 累计矿石
  lottery_name: "", // 抽中的奖品
};

// 获取今日签到情况
const todaySignInfo = async () => {
  // 请求掘金每日状态接口
  const { data } = await axios.request({
    baseURL: JueJin_Domain,
    url: "get_today_status",
    headers: { cookie },
    method: "get",
  });
  // 查询签到情况出错 - 发送邮件
  if (data.err_no !== 0) {
    sendMail(`<h1>查询签到状态接口报错：${data.err_msg}</h1>`);
    return;
  }
  // 已经签到过了 直接返回
  if (data.data) {
    console.log("今日已签到~");
    return;
  }

  // 进行签到操作
  doSign();
};

// 进行签到操作
const doSign = async () => {
  // 请求掘金签到接口
  const { data } = await axios.request({
    baseURL: JueJin_Domain,
    url: "check_in",
    headers: { cookie },
  });

  // 签到情况出错 - 发送邮件
  if (data.err_no !== 0) {
    sendMail(`<h1>签到接口报错：${data.err_msg}</h1>`);
    return;
  }

  // 签到成功，发送邮件至绑定邮箱 - 增加的矿石 & 累计矿石
  res.incr_point = data.incr_point;
  res.sum_point = data.sum_point;
  res.status = 1;
};

// 获取今日免费抽奖情况
const freeLotteryInfo = async () => {
  // 请求掘金每日状态接口
  const { data } = await axios.request({
    baseURL: JueJin_Domain,
    url: "lottery_config/get",
    headers: { cookie },
    method: "get",
  });
  // 查询每日免费抽奖情况出错 - 发送邮件 - doing
  if (data.err_no !== 0) {
    sendMail(`<h1>查询免费抽奖信息接口报错：${data.err_msg}</h1>`);
    return;
  }
  // 已经免费抽奖过了 直接返回
  if (data.data.free_count === 0) {
    console.log("今日已抽奖~");
    return;
  }

  // 进行免费抽奖操作
  doFreeLottery();
};

// 免费抽奖
const doFreeLottery = async () => {
  // 请求掘金每日状态接口
  const { data } = await axios.request({
    baseURL: JueJin_Domain,
    url: "lottery/draw",
    headers: { cookie },
  });
  // 查询每日免费抽奖情况出错 - 发送邮件
  if (data.err_no !== 0) {
    sendMail(`<h1>免费抽奖接口报错：${data.err_msg}</h1>`);
    return;
  }

  // 获取到的奖品 - 发送邮件
  res.lottery_name = data.data.lottery_name;
  res.status = 1;
};

const run = async () => {
  await todaySignInfo();
  await freeLotteryInfo();

  const resHTML = `
    <h1>掘金每日脚本</h1>
    <h2>今日签到结果：</h2>
    <p>签到新增矿石：${res.incr_point}</p>
    <p>今日累计矿石：${res.sum_point}</p>
    <p>免费机会抽中的奖品：${res.lottery_name}</p>
  `;
  res.status === 1 && sendMail(resHTML);
};

run();
