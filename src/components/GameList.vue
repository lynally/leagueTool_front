<template>
  <el-card class="GameList">
    <template #header>
      <div
        class="box-card"
        style="display: flex; justify-content: space-between"
      >
        <h1>联赛列表</h1>
        <el-button type="primary" @click="addGame('')">添加联赛</el-button>
      </div>
    </template>
    <div class="list text">
      <template v-if="gameList.length === 0">
        <el-empty description="空" />
      </template>
      <template v-else>
        <el-row>
          <el-col v-for="game in gameList" :key="game._id" :span="24">
            <div
              class="item"
              style="display: flex; justify-content: space-between"
            >
              <div style="min-width: 200px" @click="addGame(game._id)">
                {{ game.name }}
              </div>
              <el-button
                style="margin-left: 10px"
                :icon="Close"
                @click="deleteLeague(game._id)"
              />
            </div>
          </el-col>
        </el-row>
      </template>
    </div>
    <div>
      <p class="foot">
        备案号：<a href="http://beian.miit.gov.cn/" target="_blank"
          >冀ICP备2023002072号-1</a
        >
      </p>
    </div>
  </el-card>
</template>

<script setup>
import { ElMessage } from "element-plus";
import router from "@/router/index";
import { Close } from "@element-plus/icons-vue";

import { ref, onMounted } from "vue";
import { getLeagueList, delLeague } from "../api/api.js";

const gameList = ref([]);
const getList = async () => {
  const data = await getLeagueList();
  gameList.value = data || [];
};

async function deleteLeague(id) {
  const { code, msg } = await delLeague({ id: id });
  if (code !== 200) {
    ElMessage.error(msg);
    return;
  }
  // getList();
}

function addGame(gameId) {
  router.push({ path: "/gameSet", query: { gameId: gameId } });
}

onMounted(() => {
  // getList();
});
</script>

<style scoped lang="scss">
.GameList {
  width: 100%;
  height: 100vh;
  .list {
    .item {
      margin: 5px 0;
      padding: 5px 20px;
      border-radius: var(--el-card-border-radius);
      border: 1px solid var(--el-card-border-color);
      background-color: var(--el-card-bg-color);
      overflow: hidden;
      color: var(--el-text-color-primary);
      transition: var(--el-transition-duration);
    }
  }
}
.foot {
  position: fixed;
  bottom: 50px;
  width: 100%;
  left: 0;
  text-align: center;
}
</style>
