import axios from "axios";

export type UserItem = {
  userFlnm: string;
  userJbgdNm: string;
  eml: string;
  userSe: string;
};

type SelectUserListParams = {
  page: number;
  size: number;
};

export async function selectUserList({ page, size }: SelectUserListParams) {
  const body = {
    page,          
    size,          
    searchObj: {
      column: "DTL",
      searchValue: "",
      detail: [],
    },
    sortObj: { column: "", direction: "" },
  };

  const res = await axios.post(
    "http://localhost:8082/common/api/user_mng/v1/select_user/list",
    body,
    {
      headers: { userId: "sj.kim10" },
    }
  );

  return res.data;
}