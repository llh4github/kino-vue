<script setup lang="ts">
import { MenuTreeData, treeList } from "@/api/system/menu";
import { onMounted, reactive, ref } from "vue";
import { ElTreeV2, FormInstance } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'
import { Refresh, Search } from "@element-plus/icons-vue";

const loading = ref(false)
defineOptions({
  name: "Menu-Index-Page",
})
const tree = ref<MenuTreeData[]>([])
const fetchTree = async () => {
  tree.value = (await treeList()).data
}

const searchData = reactive({
  router: undefined,
  name: undefined,
})

const searchFormRef = ref<FormInstance | null>(null)
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const handleSearch = () => {
  treeRef.value!.filter(searchData.name)
}
const filterMethod = (query: any, node: TreeNode) => {
  console.log(query,node)
  return node.label!.includes(query)
}
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value?.resetFields();
  } else {
    console.debug(`搜索表单的引用为空！ ${searchFormRef.value}`)
  }
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
        <el-form-item prop="code" label="路由路径">
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
        :filter-method="handleSearch"
        :props="treeProps"
        show-checkbox />
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
