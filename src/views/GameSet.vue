<template>
  <div class="gameSet">
    <div style="display: flex;justify-content: space-between">
      <div style="display: flex;align-items: center;">
        <h1>联赛设置</h1>  <span>（单循环赛制）</span>
      </div>
      <el-button @click="back">返回</el-button>
    </div>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      status-icon
    >
      <el-form-item label="联赛名称" prop="name">
        <el-input v-model="ruleForm.name"  placeholder="联赛名称"/>
      </el-form-item>
      <el-form-item label="球队设置" prop="teams">
          <el-col v-for="(team,index) in ruleForm.teams" :key="index" >
            <el-form-item :prop='"team"+index'  >
              <div style="display:flex;justify-content: space-between">
                <el-input class="" v-model="team.value" placeholder="球队名称"></el-input>
                <el-button style="margin-left: 10px" :icon="Close"  @click="delTeam(index)"/>
              </div>
            </el-form-item>
          </el-col>
        <el-col >
          <el-button type="primary" @click="addTeam">添加球队</el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="开始日期" required>
        <el-col :span="11">
          <el-form-item prop="startData">
            <el-date-picker
                v-model="ruleForm.startDate"
                type="date"
                aria-label="选择开始日期"
                placeholder="选择开始日期"
                format="YYYY/MM/DD"
                value-format="x"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="开赛星期" prop="weeks">
        <el-checkbox-group v-model="ruleForm.weeks">
          <el-checkbox :value="1" >星期一</el-checkbox>
          <el-checkbox :value="2" >星期二</el-checkbox>
          <el-checkbox :value="3" >星期三</el-checkbox>
          <el-checkbox :value="4" >星期四</el-checkbox>
          <el-checkbox :value="5" >星期五</el-checkbox>
          <el-checkbox :value="6" >星期六</el-checkbox>
          <el-checkbox :value="0" >星期日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="开赛时间" required>
        <el-col  v-for="(time,index) in ruleForm.times" :key="index" >
          <el-form-item :prop='"time"+index' >
            <el-time-picker
                v-model="time.value"
                is-range
                type="datetime"
                range-separator="-"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="x"
            />
            <el-button  :icon="Close" @click="delTime(index)" />
          </el-form-item>
        </el-col>
        <el-col >

          <el-button type="primary" @click="addTime">增加场次</el-button>
        </el-col>
      </el-form-item>


      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">{{gameId?'更新':'生成'}}</el-button>
      </el-form-item>
    </el-form>
    <br>
    <div class="table" v-if="gameId">
      <div style="display: flex;justify-content: space-between">
        <el-button @click="createVs">更新对阵表</el-button>
        <el-button @click="exportDownloadClick">导出下载</el-button>
      </div>

      <el-table id="tableId" :data="tableData" style="width: 100%">
        <el-table-column v-for="col in tableHead" :key="col.index"
                         :label="col.value"
                         :prop="col.key" >
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script setup lang="ts">

import { reactive, ref,onMounted } from 'vue'
import { useRoute } from "vue-router";
import router from "../router/index";
import { FormInstance, FormRules } from 'element-plus'
import { useAppStoreHook } from "../store/modules/app.js";

import { ElMessage } from 'element-plus'
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import {Close} from '@element-plus/icons-vue'

let route = useRoute();

const appStore = useAppStoreHook();
const {addLeague, getLeagueInfo, getVsTable, updateLeague} = appStore

const gameId = ref(route.query.gameId)

const ruleFormRef = ref<FormInstance>()
let ruleForm = reactive({
  name: '',
  teams:[],
  startDate: 0,
  weeks:[],
  times:[],
})
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '输入联赛名称', trigger: 'blur' },
    { min: 2, max: 30, message: '3-20个字', trigger: 'blur' },
  ],
  teams:[
    {
      type: 'array',
      required: true,
      message: '至少输入一个队伍',
      trigger: 'change',
    },
  ],
  startDate: [
    {
      type: 'number',
      required: true,
      message: '请选择开始日期',
      trigger: 'change',
    },
  ],
  weeks:[
    {
      type: 'array',
      required: true,
      message: '设置星期',
      trigger: 'change',
    },
  ],
  times:[
    {
      type: 'array',
      required: true,
      message: '请设置时间',
      trigger: 'change',
    },
  ]
})

function back(){
  router.push('/')
}

onMounted(()=>{
  if(gameId.value){
    getInfo();
  }
})
function getInfo(){
  const {code,data,msg} =  getLeagueInfo({id:gameId.value})
  if(code === 200){
    console.log('联赛信息',data)
    ruleForm.id = data.id;
    ruleForm.name = data.name;
    ruleForm.startDate = data.startDateValue;
    ruleForm.teams = data.teams.map((name)=>{
      return {value:name}
    });
    ruleForm.weeks = data.week;
    ruleForm.times =  data.dailyTimeValue;

    createVs()
  }else{
    ElMessage.error(msg)
  }
}




const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      addGame();
    } else {
      console.log('请检查输入内容', fields)
    }
  })
}
const addGame =  ()=>{
  const fn = gameId.value?updateLeague:addLeague
  const {code,msg} =  fn(
      {
        id:ruleForm.id,
        name:ruleForm.name,
        teamName: JSON.stringify(ruleForm.teams),
        startDate:ruleForm.startDate,
        week:JSON.stringify(ruleForm.weeks) ,
        dailyTime:JSON.stringify(ruleForm.times),
      })
  if(code === 200){
    ElMessage({message:msg, type: 'success'})
    router.push("/");
  }else{
    ElMessage.error(msg)
  }
}


function addTeam (){
  ruleForm.teams.push({value:""})
}
function delTeam (index){
  ruleForm.teams.splice(index,1)
}
function addTime (){
  ruleForm.times.push({value:""})
}
function delTime (index){
  ruleForm.times.splice(index,1)
}

//表格
let tableHead = ref([])
let tableData = ref([])

function createVs(){
  const id = gameId.value
  if(!id){
    ElMessage.error('先创建一个联赛')
    return
  }
  const {code,data,msg} =  getVsTable({id:id})
  tableData.value =data.data;
  tableHead.value = data.head;

  if(code === 200){
    ElMessage({message:'生成成功', type: 'success'})
  }else{
    ElMessage.error(msg)
  }
}
function exportDownloadClick(){
  let dom = document.querySelector('#tableId');
  let xlsxName = `${ruleForm.name}.xlsx`;
  let xlsxParam = { raw: true }; //导出的内容只做解析，不进行格式转换
  let wb = XLSX.utils.table_to_book( dom, xlsxParam );
  let wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
  });
  try {
    FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }),xlsxName);
  }catch(e){
    if (typeof console !== 'undefined') {
      ElMessage.error("下载失败");
    }
  }
  return wbout;
}
</script>

<style scoped lang="scss">
.gameSet {
  height: 100vh;
  background-color: #ccc;
  padding: 20px;
  h1{
    margin-bottom: 20px;
  }
}
</style>
