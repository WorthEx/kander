import ExcelJS from "exceljs";

export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {year} = await readBody<{
    year: number
  }>(event)
  if (!year) return createError({
    statusCode: 400,
    statusText: 'No year provided.'
  })

  try {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: wsId
      },
      select: {
        title: true,
        currency: true
      }
    })
    if (!workspace) throw createError({statusCode: 404, statusText: 'Workspace not found.'})

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {gte: startOfYear, lte: endOfYear}
        }
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        service: true,
      },
      orderBy: {
        orderId: 'asc'
      }
    })

    // Строки таблицы
    const rows = items.map(item => ({
      orderId: item.orderId,
      serviceName: item.service.title,
      quantity: item.quantity,
      price: item.price,
      customerName: item.order.customer.fullName,
    }))

    // Сводная строка
    const totalOrders = new Set(items.map(i => i.orderId)).size
    const totalSum = items.reduce((sum, i) => sum + i.price * i.quantity, 0)


    const workbook = new ExcelJS.Workbook()
    workbook.created = new Date()

    const sheet = workbook.addWorksheet(`${workspace.title} ${year}`)

    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {argb: 'ffffd230'},
    }
    const headerFont: Partial<ExcelJS.Font> = {
      bold: true,
      color: {argb: 'ff000000'},
      size: 12,
    }
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: {style: 'thin'},
      left: {style: 'thin'},
      bottom: {style: 'thin'},
      right: {style: 'thin'},
    }

    const totalFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {argb: 'ff05df72'},
    }

    sheet.getCell('A1').value = `${workspace.title}'s annual report for ${year}`
    sheet.getCell('A1').font = {bold: true, size: 18}
    sheet.mergeCells('A1:E1')

    sheet.getCell('A3').value = `Total orders: ${totalOrders}`
    sheet.getCell('B3').value = " "
    sheet.getCell('C3').value = " "
    sheet.getCell('D3').value = `Total sum: ${totalSum}`
    sheet.getCell('E3').value = " "
    sheet.getRow(3).eachCell((cell) => {
      cell.fill = totalFill
      cell.font = headerFont
      cell.border = borderStyle
      cell.alignment = {vertical: 'middle', horizontal: 'left'}
    })
    sheet.getRow(3).height = 20

    sheet.columns = [
      {
        key: 'orderId',
        width: 40,
        style: {border: borderStyle, alignment: {horizontal: "left"}}
      },
      {
        key: 'serviceName',
        width: 45,
        style: {border: borderStyle, alignment: {horizontal: "left"}}
      },
      {
        key: 'quantity',
        width: 12,
        style: {border: borderStyle, alignment: {horizontal: "left"}}
      },
      {
        key: 'price',
        width: 25,
        style: {border: borderStyle, alignment: {horizontal: "left"}}
      },
      {
        key: 'customerName',
        width: 35,
        style: {border: borderStyle, alignment: {horizontal: "left"}}
      },
    ]
    sheet.addRow({
      orderId: 'Order UUID',
      serviceName: 'Service',
      quantity: 'Amount',
      price: `Price ${workspace.currency}`,
      customerName: 'Customer',
    })

    sheet.getRow(4).eachCell((cell) => {
      cell.fill = headerFill
      cell.font = headerFont
      cell.alignment = {vertical: 'middle', horizontal: 'left'}
    })
    sheet.getRow(4).height = 20
    sheet.addRows(rows)

    // sheet.views = [{state: 'frozen', ySplit: 3}]

    const workspaceTitleSlug = workspace.title.split(' ').join('-')
    const fileName = encodeURIComponent(`AR_${workspaceTitleSlug}_${year}.xlsx`)

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)

    return await workbook.xlsx.writeBuffer()
  } catch (e) {
    console.log(e)
    throw createError({statusCode: 500, statusMessage: 'Couldn\'t generate report.'})
  }
})
