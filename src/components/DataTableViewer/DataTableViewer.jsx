import { useMemo } from 'react';
import { flexRender,getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import './table-style.css';
import Pager from './Pagination/Pager';
import TableSortButton from '../TableSortButton/TableSortButton';
import fuzzyFilter from './Filtering/fuzzyFilter';

const DataTableViewer = ({ data,columns, pageLimit,enableFilter}) => {
    
    
    
    let table = useReactTable({ data,columns, getCoreRowModel: getCoreRowModel(),
       getPaginationRowModel: getPaginationRowModel(),
       getSortedRowModel: getSortedRowModel(),
       getFilteredRowModel: getFilteredRowModel(),
       initialState:{
        pagination:{
          pageSize:pageLimit>1?pageLimit:10
        }
       },
       filterFns:{
        fuzzy:fuzzyFilter,
       },       
       globalFilterFn: fuzzyFilter,
       columnResizeMode:"onChange",
       });
     
       
    return (
        <div  className='w3-container w3-responsive ' >
            { enableFilter && (<div className='filter-text-section'>
               <input  type="text" className="filter-text form-control" 
               name="filterBooks" 
               onChange={e=>table.setGlobalFilter(e.target.value)}
               placeholder=" Filter..." maxLength={80}/>
            </div>)}
          

              <table className='w3-table-all w3-hoverable' width={table.getTotalSize()}>

                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className='w3-light-grey'>{
                         headerGroup.headers.map(header => {                               
                    return   <th className='resizer-position ' key={header.id} style={{width:header.getSize()}} colSpan={header.colSpan}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <TableSortButton  handleSort={header.column.getToggleSortingHandler()} />
                                <div 
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`resizer ${header.column.getIsResizing()? "isResizing":" "}`}>
                                 </div>
                            </th>
 
                           })
                        }</tr>)
                    )}
                </thead>
                <tbody>
                 {
                   table.getRowModel().rows.map(row=>{
                    return <tr key={row.id} >
                    {
                     row.getVisibleCells().map( cell=> (
                        <td key={cell.id} width={cell.column.getSize()}>
                             { flexRender(cell.column.columnDef.cell, cell.getContext())  }
                        </td>
                        )
                     )
                    }
                    </tr>
                   })              
                  }               
                </tbody>
            </table>
            <Pager pager={table}/>
          
        </div>
    )

}
export default DataTableViewer;