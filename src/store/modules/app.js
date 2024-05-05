import { store } from "@/store";
import { defineStore } from "pinia";
import dayjs from "dayjs";

export const useAppStore = defineStore("football", {
  state: () => ({
    leagueList: [],
    leagueInfo: {},
    vsTable: [],
  }),
  getters: {
    // double: (state) => state.count * 2,
  },
  actions: {
    getLeagueInfo(param) {
      const league = this.leagueList.find((item) => item.id == param.id);
      return {
        code: 200,
        data: league,
        msg: "sucess",
      };
    },

    addLeague(param) {
      const name = param.name;
      const teamName = param.teamName;
      const startDateValue = param.startDate;
      const startDate = dayjs(new Date(Number(param.startDate))).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const week = param.week;
      const dailyTime = param.dailyTime;

      if (!name) {
        return { code: 201, msg: "添加联赛失败，缺少名字" };
      }
      if (!teamName) {
        return { code: 202, msg: "球队名称为空" };
      }
      var game = {
        id: dayjs().valueOf(),
        name: param.name,
        teams: JSON.parse(teamName).map((obj) => obj.value),
        startDate,
        startDateValue,
        week: JSON.parse(week),
        dailyTime: JSON.parse(dailyTime).map((obj) => {
          const time = obj.value;
          return time.reduce((pre, cur) => {
            const start = dayjs(new Date(pre)).format("HH:mm");
            const end = dayjs(new Date(cur)).format("HH:mm");
            return `${start}-${end}`;
          });
        }),
        dailyTimeValue: JSON.parse(dailyTime),
      };
      this.leagueList.push(game);
      return { code: 200, data: this.leagueList, msg: `${param.name}创建成功` };
      // game.save().then(function (product) {
      //   res.json({ code: 200, data: product, msg: `${param.name}创建成功` });
      // });
    },

    updateLeague(param) {
      if (!param.id) {
        return {
          code: "201",
          msg: "缺少id",
        };
      }
      const name = param.name;
      const teamName = param.teamName;
      const startDateValue = param.startDate;
      const startDate = dayjs(new Date(Number(param.startDate))).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const week = param.week;
      const dailyTime = param.dailyTime;

      if (!name) {
        return { code: 201, msg: "更新联赛失败，缺少名字" };
      }
      if (!teamName) {
        return { code: 202, msg: "球队名称为空" };
      }
      const {
        code,
        data: leagueInfo,
        msg,
      } = this.getLeagueInfo({ id: param.id });
      if (!leagueInfo) {
        return {
          code: "203",
          msg: "未找到联赛",
        };
      } else {
        Object.assign(leagueInfo, {
          name: param.name,
          teams: JSON.parse(teamName).map((obj) => obj.value),
          startDate,
          startDateValue,
          week: JSON.parse(week),
          dailyTime: JSON.parse(dailyTime).map((obj) => {
            const time = obj.value;
            return time.reduce((pre, cur) => {
              const start = dayjs(new Date(pre)).format("HH:mm");
              const end = dayjs(new Date(cur)).format("HH:mm");
              return `${start}-${end}`;
            });
          }),
          dailyTimeValue: JSON.parse(dailyTime),
        });
        return {
          code: 200,
          msg: "更新成功",
        };
      }
    },

    delLeague(param) {
      const index = this.leagueList.findIndex((obj) => obj.id == param.id);
      if (index !== -1) this.leagueList.splice(index, 1);
    },

    getVsTable(param) {
      const { code, data: league, msg } = this.getLeagueInfo({ id: param.id });
      if (!league) {
        return {
          code: "201",
          msg: `未找到指定联赛:${param.id}`,
        };
      }
      if (!league.teams || league.teams.length === 0) {
        return {
          code: "202",
          msg: `给联赛联赛:${league.name}添加队伍`,
        };
      }
      if (!league.dailyTime || !league.startDate || !league.week) {
        return {
          code: "203",
          msg: `给联赛联赛:${league.name}设置时间`,
        };
      }

      const teams = league.teams;
      const vsArr = [];
      teams.forEach((item1, index1) => {
        teams.forEach((item2, index2) => {
          if (index1 < index2) {
            vsArr.push(item1 + "-" + item2);
          }
        });
      });
      vsArr.sort(() => Math.random() - 0.5);
      console.log("总比赛", vsArr, vsArr.length);
      // 日期、星期、时间
      const startDate = new Date(Number(league.startDateValue));
      const week = league.week;
      const dailyTime = league.dailyTime;

      const days_vs = {}; // 赛程日期
      // eslint-disable-next-line new-cap
      let curDate = dayjs(startDate);
      while (vsArr.length > 0) {
        const weekday = curDate.day();
        if (week.includes(weekday)) {
          const date = curDate.format("M.DD");
          const obj = {};
          dailyTime.forEach((timeRange) => {
            const vs = vsArr.shift();
            if (!vs) {
              return false;
            }
            obj[timeRange] = vs;
          });
          days_vs[date] = obj;
        }
        curDate = curDate.add(1, "day");
      }
      console.log("赛程日期", days_vs);
      let colsArr = [
        { key: "index", value: "轮次" },
        { key: "data", value: "日期" },
      ];
      dailyTime.forEach((timeRange) => {
        colsArr.push({ key: `${timeRange}`, value: timeRange });
      });
      let array = [];
      let index = 1;
      // eslint-disable-next-line guard-for-in
      for (var key in days_vs) {
        const val = days_vs[key];
        const row = {
          index: index,
          data: key,
        };
        // eslint-disable-next-line guard-for-in
        for (let time in val) {
          row[time] = val[time];
        }
        index++;
        array.push(row);
      }
      array.concat(array);
      return {
        code: 200,
        data: {
          head: colsArr,
          data: array,
        },
        msg: "成功",
      };
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}
