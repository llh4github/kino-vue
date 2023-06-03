<script setup lang="ts">
import { MenuTreeData, treeList } from "@/api/system/menu";
import { onMounted, reactive, ref } from "vue";
import { ElTreeV2, FormInstance, TreeNode } from 'element-plus'
import { Check, Edit, Message, Refresh, Search } from "@element-plus/icons-vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";

const loading = ref(false)
defineOptions({
  name: "Menu-Index-Page",
})
const tree = ref<MenuTreeData[]>([])


const searchData = reactive({
  router: undefined,
  name: undefined,
})

const showTools = ref<number | null>(null)
const fetchTree = async () => {
  tree.value = (await treeList(searchData)).data
}
const searchFormRef = ref<FormInstance | null>(null)
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const handleSearch = () => {
  loading.value = true
  fetchTree()
  loading.value = false
}

const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value?.resetFields();
    fetchTree()
  } else {
    console.debug(`搜索表单的引用为空！ ${searchFormRef.value}`)
  }
}

const nodeClick = (data: TreeNodeData) => {
  showTools.value = data.id
}
const treeProps = {
  label: 'name',
  children: "children",
}
onMounted(() => {
  fetchTree()
})
</script>
<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="菜单名">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="router" label="路由路径">
          <el-input v-model="searchData.router" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

    </el-card>

    <el-card v-loading="loading" shadow="never">
      <el-tree-v2
        ref="treeRef"
        :data="tree"
        @node-click="nodeClick"
        :props="treeProps"
        :item-size="35"
        :height="500"
        show-checkbox>
        <template #default="{node}">
          <el-space wrap>
            <el-text size="large">{{ node.label }}</el-text>
            <el-row v-show="showTools == node.key">
              <el-button type="primary" :icon="Edit" circle size="small" />
              <el-button type="success" :icon="Check" circle size="small" />
              <el-button type="info" :icon="Message" circle size="small" />
            </el-row>
          </el-space>
        </template>
      </el-tree-v2>
    </el-card>
  </div>
</template>

<style scoped lang="scss">


.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
