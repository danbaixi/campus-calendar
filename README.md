# Campus Calendar 校历
一款react的校历组件 [查看DEMO](https://danbaixi.github.io/campus-calendar/)

## 安装
```bash
npm install campus-calendar -D
```

## 使用
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from 'campus-calendar'

const config = {
    "displayPreMonthDate": false,
    "displayNextMonthDate": false
}

const data = {
    "terms":[
        {
            "term": "20200",
            "title": "2020-2021学年第一学期",
            "start": "2020-09-07",
            "end": "2021-01-23"
        }
    ],
    "events":[
        {
            "term": "20200",
            "title": "正式上课",
            "start": "2020-09-07"
        }
    ]
}

const App = () => {
    return <Calendar config={config} data={data} />
}
ReactDOM.render(
    <App />,
    document.getElementById('root')
);
```
## API
| 属性 | 说明   | 类型 | 默认值 |
| ------ | -------- | ------ | ------ |
| config | 组件配置 | Object |        |
| data   | 数据源 | Object |        |

## Config
| 属性                   | 说明         | 类型      | 默认值                                                                                                                                    |
|----------------------|------------|---------|----------------------------------------------------------------------------------------------------------------------------------------|
| weekdays             | 星期标题       | Array   | \["日","一","二","三","四","五","六"\]                                                                                                        |
| colors               | 配色         | Array   | \["\#e54d42", "\#6739b6", "\#1cbbb4", "\#fbbd08", "\#f37b1d", "\#e03997", "\#557571", "\#28df99", "\#9c26b0", "\#09bb07", "\#0081ff"\] |
| dateDelimiter        | 日期分隔符      | String  | \-                                                                                                                                     |
| displayPreMonthDate  | 是否显示上个月的日期 | Boolean | true                                                                                                                                   |
| displayNextMonthDate | 是否显示下个月的日期 | Boolean | true                                                                                                                                   |

## Data
```js
{
    "terms":[
        {
            "term": "20190", //学期编号，与events的term对应
            "title": "2019-2020学年第一学期", //学期标题
            "start": "2019-09-02", //开学日期
            "end": "2020-01-11" //放假日期
        }
    ],
    "events":[
        {
            "term": "20200", //学期编号
            "title": "行政人员上班", //事件标题
            "start": "2020-09-02" //开始时间，如果只有1天，end可省略
        },
        {
            "term": "20200",
            "title": "补考、重修考试",
            "start": "2020-09-05",
            "end": "2020-09-06" //结束日期
        },
    ]
}
```