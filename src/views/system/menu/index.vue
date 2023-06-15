<script setup lang="ts">
import { addData, deleteData, MenuAddOrUpdateData, MenuTreeData, treeList, updateData } from "@/api/system/menu";
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, ElTreeSelect, ElTreeV2, FormInstance, FormRules } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";

const loading = ref(false)
defineOptions({
  name: "Menu-Index-Page",
})
const tree = ref<MenuTreeData[]>([])

const dialogVisible = ref(false)
const formData = reactive<MenuAddOrUpdateData>({ name: "", router: "" })

const formRules: FormRules = reactive({})
const formRef = ref<FormInstance | null>(null)

const cancelDialog = () => {
  console.debug("取消")
  formRef.value?.clearValidate()
  dialogVisible.value = false
}

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

const submitUpdateOrAdd = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      let requestMethod = updateData
      if (formData.id) {
        console.log(`修改菜单 ${formData.id} 数据`)
      } else {
        requestMethod = addData
      }
      requestMethod(formData).then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        formRef.value?.resetFields()
        fetchTree()
      })
        .catch((e) => {
          console.error("创建或更新数据失败！", e)
        })
    }
  })
}
const handleEdit = (row?: MenuAddOrUpdateData) => {
  dialogVisible.value = true
  if (row) {
    formData.id = row.id
    formData.name = row.name
    formData.router = row.router
    formData.parentId = row.parentId
  }
}
const handleAdd = (row?: MenuAddOrUpdateData) => {
  dialogVisible.value = true
  if (row) {
    formData.parentId = row.id
  }
}
const handleDelete = (row: MenuAddOrUpdateData) => {
  const id = row.id
  if (id) {
    ElMessageBox.confirm("删除当前及其所有子菜单？")
      .then(() => {
        deleteData(id)
          .then(res => {
            ElMessage({ type: "info", message: `删除${res.data}条数据` })
            fetchTree()
          })
          .catch(e => {
            console.error("删除菜单数据失败！", e)
          })
      })
  } else {
    ElMessage({
      type: "info",
      message: "请刷新页面后再试",
    })
  }

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
        :height="500">
        <template #default="{node}">
          <el-space wrap>
            <el-text size="large">{{ node.label }}</el-text>
            <el-row v-show="showTools == node.key" style="z-index: 999">
              <el-button type="primary" :icon="Edit" @click.stop="handleEdit(node.data)" circle size="small" />
              <el-button type="success" :icon="Plus" @click.stop="handleAdd(node.data)" circle size="small" />
              <el-button type="warning" :icon="Delete" @click.stop="handleDelete(node.data)" circle size="small" />
            </el-row>
          </el-space>
        </template>
      </el-tree-v2>
    </el-card>
    <el-dialog
      width="30%"
      :title="formData.id != undefined ? '修改数据': '新增下级菜单'"
      v-model="dialogVisible">

      <el-form ref="formRef"
               :model="formData"
               :rules="formRules"
               label-width="100px"
               label-position="left"
      >

        <el-form-item prop="name" label="菜单名称">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item prop="router" label="菜单路由">
          <el-input v-model="formData.router" placeholder="请输入" />
        </el-form-item>

        <el-form-item prop="parentId" label="上级菜单">
          <el-tree-select
            v-model="formData.parentId"
            :data="tree"
            check-strictly
            value-key="id"
            :props="treeProps"
            :render-after-expand="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="submitUpdateOrAdd">确认</el-button>
      </template>
    </el-dialog>
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
