import { fireEvent, render, screen } from "@testing-library/react"
import { DataTable } from "../../src/components/Common/Table"
import "@testing-library/jest-dom"
import type { CellContext } from "@tanstack/react-table"

type TestData = {
  id: string
  name: string
  value: number
}

const columns = [
  {
    header: "Name",
    accessorKey: "name",
    cell: (info: CellContext<TestData, string>) => info.getValue(),
  },
  {
    header: "Value",
    accessorKey: "value",
    cell: (info: CellContext<TestData, string>) => info.getValue(),
  },
]

const data: TestData[] = [
  { id: "1", name: "Item 1", value: 10 },
  { id: "2", name: "Item 2", value: 20 },
]

describe("DataTable Component", () => {
  it("renders table headers correctly", () => {
    render(<DataTable data={[]} columns={columns} />)
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Value")).toBeInTheDocument()
  })

  it("renders correct number of rows", () => {
    render(<DataTable data={data} columns={columns} />)
    const rows = screen.getAllByRole("row")
    expect(rows.length).toBe(data.length + 1) // +1 for header row
  })

  it("renders correct cell data", () => {
    render(<DataTable data={data} columns={columns} />)
    for (const item of data) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
      expect(screen.getByText(item.value.toString())).toBeInTheDocument()
    }
  })

  it("handles row click correctly", () => {
    const handleRowClick = jest.fn()
    render(
      <DataTable data={data} columns={columns} onRowClick={handleRowClick} />,
    )

    const firstRow = screen.getAllByRole("row")[1] // skipping header
    fireEvent.click(firstRow)

    expect(handleRowClick).toHaveBeenCalledWith(data[0])
  })
})
