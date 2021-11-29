const axios = require("../lib/request");
const sendMail = require("../lib/mail");
const { JueJin_Domain } = require("../config/domain");

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
