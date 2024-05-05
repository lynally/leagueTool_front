<template>
  <el-card class="gameList">
    <template #header>
      <div
        class="flex is-justify-center box-card"
        style="display: flex; justify-content: space-between"
      >
        <h1>联赛列表</h1>
        <el-button type="primary" @click="addGame('')">添加联赛</el-button>
      </div>
    </template>
    <div class="list text">
      <template v-if="leagueList.length === 0">
        <el-empty style="margin-top: 20vh" :image-size="80" description=" " />
      </template>
      <template v-else>
        <el-row>
          <el-col v-for="game in leagueList" :key="game.id" :span="24">
            <div
              class="item"
              style="display: flex; justify-content: space-between"
            >
              <div style="min-width: 200px" @click="addGame(game.id)">
                {{ game.name }}
              </div>
              <el-button
                style="margin-left: 10px"
                :icon="Close"
                @click="deleteLeague(game.id)"
              />
            </div>
          </el-col>
        </el-row>
      </template>
    </div>
  </el-card>
</template>

<script setup>
import { ElMessage } from "element-plus";
import router from "@/router/index";

import { useAppStoreHook } from "../store/modules/app.js";
import { storeToRefs } from "pinia";

import { Close } from "@element-plus/icons-vue";

const appStore = useAppStoreHook();
const { delLeague } = appStore;
const { leagueList } = storeToRefs(appStore);

async function deleteLeague(id) {
  const { code, msg } = await delLeague({ id: id });
  if (code !== 200) {
    ElMessage.error(msg);
  }
}

function addGame(gameId) {
  router.push({ path: "/gameSet", query: { gameId: gameId } });
}
</script>

<style scoped lang="scss">
.gameList {
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
</style>
