<?php

namespace app\admin\library\traits;

trait Backend
{

    /**
     * 查看
     */
    public function index()
    {
        if ($this->request->isAjax())
        {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $total = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->count();

            $list = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
          
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost())
        {
            $this->code = -1;
            $params = $this->request->post("row/a");
            if ($params)
            {
                foreach ($params as $k => &$v)
                {
                    $v = is_array($v) ? implode(',', $v) : $v;
                }
                try
                {
                    $result = $this->model->create($params);
                    if ($result !== false)
                    {
                        $this->code = 1;
                    }
                    else
                    {
                        $this->msg = $this->model->getError();
                    }
                }
                catch (think\Exception $e)
                {
                    $this->msg = $e->getMessage();
                }
            }
            else
            {
                $this->msg = __('Parameter %s can not be empty', '');
            }

            return;
        }
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = NULL)
    {
        $row = $this->model->get($ids);
        if (!$row)
            $this->error(__('No Results were found'));
        if ($this->request->isPost())
        {
            $this->code = -1;
            $params = $this->request->post("row/a");
            if ($params)
            {
                foreach ($params as $k => &$v)
                {
                    $v = is_array($v) ? implode(',', $v) : $v;
                }
                try
                {
                    $result = $row->save($params);
                    if ($result !== false)
                    {
                        $this->code = 1;
                    }
                    else
                    {
                        $this->msg = $row->getError();
                    }
                }
                catch (think\Exception $e)
                {
                    $this->msg = $e->getMessage();
                }
            }
            else
            {
                $this->msg = __('Parameter %s can not be empty', '');
            }

            return;
        }
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        $this->code = -1;
        if ($ids)
        {
            $count = $this->model->destroy($ids);
            if ($count)
            {
                $this->code = 1;
            }
        }

        return;
    }

    /**
     * 批量更新
     */
    public function multi($ids = "")
    {
        $this->code = -1;
        $ids = $ids ? $ids : $this->request->param("ids");
        if ($ids)
        {
            if ($this->request->has('params'))
            {
                parse_str($this->request->post("params"), $values);
                $values = array_intersect_key($values, array_flip(array('status')));
                if ($values)
                {
                    $count = $this->model->where($this->model->getPk(), 'in', $ids)->update($values);
                    if ($count)
                    {
                        $this->code = 1;
                    }
                }
            }
            else
            {
                $this->msg = __('Parameter %s can not be empty', '');
            }
        }

        return;
    }

}
