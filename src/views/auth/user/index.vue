<script setup lang="ts">
import { CirclePlus, Delete, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { reactive, ref, watch } from "vue";
import { allData } from "@/api/auth/role"
import { PwdResetDto, RoleInfo, UserAddOrUpdateDto, UserInfoDto } from "@/api/auth/types";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime } from "@/utils";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  addData,
  disableUser,
  enableUser,
  pageQuery,
  updateData,
  updatePassword,
  userDetailWithRole,
} from "@/api/auth/user";
import { passwordStrength } from 'check-password-strength'

defineOptions({
  name: "User-Index-Page",
})
const loading = ref<boolean>(false)
//region 搜索栏逻辑
const dialogVisible = ref(false)
const searchData = reactive({
  username: undefined,
})
const searchFormRef = ref<FormInstance | null>(null)
const handleSearch = () => {
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
//endregion

//region 新增或更新逻辑
const formRef = ref<FormInstance | null>(null)
const formData = reactive<UserAddOrUpdateDto>({ password: "", roleIds: [], username: "" })
const roles = ref<RoleInfo[]>([])

const dialogVisiblePwdReset = ref(false)
const pwdResetFormRef = ref<FormInstance | null>(null)
const pwdResetFormData = reactive<PwdResetDto>({
  id: 0, password: "", passwordConfirm: "",
})
const fetchAllRole = async () => {
  const resp = await allData()
  roles.value = resp.data ?? []
}
const validatePwdStrength = (rule: any, value: any, callback: any) => {
  const strength = passwordStrength(value).id
  if (strength < 2) {
    callback(new Error("密码太简单"))
  } else {
    callback()
  }
}
const validatePwdConfirm = (rule: any, value: any, callback: any) => {
  validatePwdConfirmFunc(rule, value, callback, formData)
}
const validatePwdConfirmForReset = (rule: any, value: any, callback: any) => {
  validatePwdConfirmFunc(rule, value, callback, pwdResetFormData)
}
const validatePwdConfirmFunc = (rule: any, value: any, callback: any, formData: UserAddOrUpdateDto | PwdResetDto) => {
  const pwd = formData.password
  if (pwd != value) {
    callback(new Error("密码不一致"))
  } else {
    callback()
  }
}

const controlDialog = async (row?: UserAddOrUpdateDto) => {
  await fetchAllRole()
  formData.username = row?.username ?? ""
  formData.id = row?.id
  formData.password = row?.password ?? ""
  if (row?.id) {
    const resp = await userDetailWithRole(row.id)
    if (resp.data) {
      const info = resp.data
      formData.id = info.id
      formData.username = info.username
      formData.roleIds = info?.roles
        ?.map((ele) => ele.id)
        .filter(ele => ele != undefined)
        .map(ele => ele as number) ?? []
      dialogVisible.value = true
    } else {
      ElMessage.error("数据不存在，请刷新后再试")
      dialogVisible.value = false
    }
  } else {
    dialogVisible.value = true
  }
}

const controlResetPwdDialog = (row: UserInfoDto) => {
  pwdResetFormData.id = row.id
  dialogVisiblePwdReset.value = true
}
const closeResetPwdDialog = () => {
  dialogVisiblePwdReset.value = false
  pwdResetFormRef.value?.resetFields()
}
const handleResetPwd = () => {
  pwdResetFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      updatePassword(pwdResetFormData).then((res) => {
        if (res.data) {
          ElMessage.info("修改成功")
          dialogVisiblePwdReset.value = false
        } else {
          ElMessage.info("修改失败")
        }
      }).catch((err) => {
        console.error("修改密码失败", err)
      })
    }
  })

}
const resetPwdRules = {
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { validator: validatePwdStrength, trigger: "blur" },
  ],
  passwordConfirm: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { validator: validatePwdConfirmForReset, trigger: "blur" },
  ],
}
const pwdRules = {
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { validator: validatePwdStrength, trigger: "blur" },
  ],
  passwordConfirm: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { validator: validatePwdConfirm, trigger: "blur" },
  ],
}
const pwdResetFormRules: FormRules = reactive({
  ...resetPwdRules,
})
const formRules: FormRules = reactive({
  username: [
    { required: true, trigger: "blur", message: "请输入用户名" },
    { min: 1, max: 10, message: "长度应该在 1 到 10 之间", trigger: "blur" },
  ],
  ...pwdRules,
  roleIds: [
    { required: true, trigger: "blur", message: "请输入用户名" },
  ],
})
const cancelDialog = () => {
  console.debug("取消")
  formRef.value?.clearValidate()
  formData.roleIds = []
  dialogVisible.value = false
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      let requestMethod = updateData
      if (formData.id) {
        console.debug("有ID，调用更新接口")
      } else {
        console.debug("没有ID，调用创建接口")
        requestMethod = addData
      }
      requestMethod(formData)
        .then(() => {
          ElMessage.success("操作成功")
          dialogVisible.value = false
          formRef.value?.resetFields()
          getTableData()
        })
        .catch(() => {
          console.error("创建或更新数据失败！")
        })
    } else {
      return false
    }
  })
}
//endregion

//region 列表分页逻辑
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const tableData = ref<RoleInfo[]>([])
const handleRefresh = () => {
  getTableData()
}
const getTableData = () => {
  loading.value = true
  pageQuery({
    page: paginationData.currentPage,
    size: paginationData.pageSize,
    ...searchData,
  }).then((res) => {
    if (res.data) {
      paginationData.total = res.data?.totalElements ?? 0
      tableData.value = res.data?.content ?? []
    }
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })
}
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value?.resetFields();
  } else {
    console.debug(`搜索表单的引用为空！ ${searchFormRef.value}`)
  }
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}

const handleSelectChange = (selections: { id?: number }[]) => {
  const ids = selections.filter((ele) => ele.id).map((ele) => ele.id!)
  if (ids) {
    selectedIds.value = ids
  }
  console.debug("已经选择的ID列表: ", ids)
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
//endregion


//#region 删
const selectedIds = ref<number[]>([])
const handleDeleteMuch = () => {
  const list = selectedIds.value
  if (list.length <= 0) {
    ElMessage.warning("未选择数据")
    return
  }
  ElMessageBox.confirm(`确认禁用 ${list.length} 个用户？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    disableUser(selectedIds.value).then(() => {
      ElMessage.success("禁用成功")
      getTableData()
    })
  });
}

const handleDeleteOne = (row: any) => {
  ElMessageBox.confirm(`确认禁用此条数据？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    disableUser([row.id]).then(() => {
      ElMessage.success("禁用成功")
      getTableData()
    })
  }).catch((err) => {
    console.debug("用户取消禁用", err)
  })
}

const handleEnableOne = (row: any) => {
  ElMessageBox.confirm(`确认启用此用户？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    enableUser([row.id]).then(() => {
      ElMessage.success("启用成功")
      getTableData()
    })
  }).catch((err) => {
    console.debug("用户取消启用", err)
  })
}
//#endregion

</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="controlDialog">新增用户</el-button>
          <el-button type="danger" :icon="Delete" @click="handleDeleteMuch">批量禁用</el-button>
        </div>
        <div>
          <!--
                    <el-tooltip content="下载">
                      <el-button type="primary" :icon="Download" circle />
                    </el-tooltip>
                    -->
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData"
                  @selection-change="handleSelectChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="username" label="用户名" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag size="small" type="warning" v-if="scope.row.status == 0">禁用</el-tag>
              <el-tag size="small" type="info" v-if="scope.row.status == 1">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="roles" label="拥有角色">
            <template #default="scope">
              <el-space wrap>
                <template v-for="item in scope.row.roles">
                  <el-tag size="small">{{ item.name }}</el-tag>
                </template>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="createdTime" label="创建时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdTime) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="250" align="center">
            <template #default="scope">
              <el-space wrap>
                <el-button type="primary" text bg size="small" @click="controlDialog(scope.row)">修改</el-button>
                <el-button type="primary" text bg size="small" @click="controlResetPwdDialog(scope.row)">修改密码
                </el-button>
                <el-button type="danger" text bg size="small"
                           @click="handleDeleteOne(scope.row)" v-if="scope.row.status != 0">禁用
                </el-button>
                <el-button type="danger" text bg size="small"
                           @click="handleEnableOne(scope.row)" v-else>启用
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      width="30%"
      :title="formData.id != undefined ? '修改数据': '新增数据'"
      v-model="dialogVisible">
      <el-form ref="formRef" :model="formData"
               :rules="formRules"
               label-width="100px" label-position="left"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="formData.username"
                    :disabled="formData.id != undefined"
                    placeholder="请输入用户名" />
        </el-form-item>
        <template v-if="!formData.id">
          <el-form-item prop="password" label="密码">
            <el-input type="password" v-model="formData.password" placeholder="请输入密码" show-password />
          </el-form-item>

          <el-form-item prop="passwordConfirm" label="确认密码">
            <el-input type="password" v-model="formData.passwordConfirm" placeholder="请输入密码" show-password />
          </el-form-item>
        </template>
        <el-form-item prop="roleIds" label="选择角色">
          <el-checkbox-group v-model="formData.roleIds">
            <template v-for="item in roles">
              <el-checkbox
                :label="item.id"
                :name="item.name"
                :checked="formData?.roleIds?.indexOf(item.id!!) > 0"
              >{{ item.name }}
              </el-checkbox>
            </template>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate">确认</el-button>
      </template>
    </el-dialog>
  </div>

  <el-dialog
    width="30%"
    title="修改密码"
    v-model="dialogVisiblePwdReset">
    <el-form ref="pwdResetFormRef" :model="pwdResetFormData "
             :rules="pwdResetFormRules"
             label-width="100px" label-position="left"
    >

      <el-form-item prop="password" label="新密码">
        <el-input type="password" v-model="pwdResetFormData.password" placeholder="请输入密码" show-password />
      </el-form-item>

      <el-form-item prop="passwordConfirm" label="确认密码">
        <el-input type="password" v-model="pwdResetFormData.passwordConfirm" placeholder="请输入密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeResetPwdDialog">取消</el-button>
      <el-button type="primary" @click="handleResetPwd">确认</el-button>
    </template>
  </el-dialog>

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
