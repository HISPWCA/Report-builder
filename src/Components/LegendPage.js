import {
    Button,
    ButtonStrip,
    Field,
    Input,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    SingleSelect,
    SingleSelectOption,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TableRowHead
} from '@dhis2/ui'
import { useState } from 'react'
import { SketchPicker } from 'react-color'
import Scrollbars from 'react-custom-scrollbars-2'
// import { RiImageAddFill } from 'react-icons/ri'
import { COLOR, IMAGE, LABEL } from '../utils/constants'
import { v4 as uuid } from 'uuid'
import { BiEdit } from 'react-icons/bi'
import { RiDeleteBinLine } from 'react-icons/ri'
import moment from 'moment'
import { getFileAsBase64 } from '../utils/fonctions'


const LegendPage = ({
    setNotification,
    handleSaveDataToDataStore,
    loadingSendDatas,
    dataStoreReports,
    loadingDataStoreReports
}) => {

    const [visibleAddItemImageList, setVisibleAddItemImageList] = useState(false)
    const [visibleNewLegendForm, setVisibleNewLegendForm] = useState(false)
    const [visibleAddLegendItem, setVisibleAddLegendItem] = useState(false)
    const [visibleDefaultLegendImageMissingData, setVisibleDefaultLegendImageMissingData] = useState(false)
    const [visibleDefaultLegendImageNotApplicable, setVisibleDefaultLegendImageNotApplicable] = useState(false)


    const [legendDefaultType, setLegendDefaultType] = useState(COLOR)
    const [legendName, setLegendName] = useState(null)
    const [legendItemName, setLegendItemName] = useState(null)
    const [legendDefaultMissingData, setLegendDefaultMissingData] = useState(null)
    const [legendDefaultNotApplicable, setLegendDefaultNotApplicable] = useState(null)
    const [legendItemColorSelected, setLegendItemColorSelected] = useState('#000000')
    const [legendItemImageSelected, setLegendItemImageSelected] = useState(null)
    const [legendItemIntervalStart, setLegendItemIntervalStart] = useState(null)
    const [legendItemIntervalEnd, setLegendItemIntervalEnd] = useState(null)
    const [errorMessageLegendItem, setErrorMessageLegendItem] = useState(null)
    const [legendItemList, setLegendItemList] = useState([])
    // const [legendItemSelected, setLegendItemSelected] = useState(null)
    const [editLegendItem, setEditLegendItem] = useState(false)
    const [editLegend, setEditLegend] = useState(false)
    const [currentLegend, setCurrentLegend] = useState(null)
    const [currentLegendItem, setCurrentLegendItem] = useState(null)

    const [min, setMin] = useState(null)
    const [max, setMax] = useState(null)
    const [intervalSpace, setIntervalSpace] = useState(3)

    const [generateErrorMessage, setGenerateErrorMessage] = useState(null)

    const handleNewLegendBtn = () => {
        setVisibleNewLegendForm(true)
    }

    const handleNewLegendItemBtn = () => { setVisibleAddLegendItem(true) }

    const handleCancelAddItemLegend = () => {
        setVisibleAddLegendItem(false)
        cleanStateAddItemLegend()
    }

    const handleEditLegendItem = (leg) => {
        setLegendItemColorSelected(leg.color)
        setLegendItemImageSelected(leg.image)
        setLegendItemName(leg.name)
        setLegendItemIntervalStart(leg.start)
        setLegendItemIntervalEnd(leg.end)
        setErrorMessageLegendItem(null)
        setVisibleAddLegendItem(true)
        setEditLegendItem(true)
        setCurrentLegendItem(leg)
    }


    const handleDeleteLegendItem = (id) => {
        if (id) {
            setLegendItemList(legendItemList.filter(leg => leg.id !== id))
        }
    }


    const cleanStateAddItemLegend = () => {
        setLegendItemColorSelected("#000000")
        setLegendItemImageSelected(null)
        setLegendItemName(null)
        setLegendItemIntervalStart(null)
        setLegendItemIntervalEnd(null)
        setErrorMessageLegendItem(null)
        setCurrentLegendItem(null)
        setVisibleAddItemImageList(false)
        setEditLegendItem(false)
    }

    const handleSaveAddLegendItem = () => {
        try {

            if (!legendItemName)
                throw new Error("Item name is required")
            if (!legendItemIntervalEnd)
                throw new Error("Interval End is required")

            if (parseFloat(legendItemIntervalEnd) <= parseFloat(legendItemIntervalStart))
                throw new Error("The End interval must be gratter than start ")

            let newObject = {}
            if (editLegendItem && currentLegendItem) {
                setLegendItemList(
                    legendItemList.map(l => {
                        if (l.id === currentLegendItem.id) {
                            return {
                                ...l,
                                name: legendItemName,
                                start: legendItemIntervalStart,
                                end: legendItemIntervalEnd,
                                image: legendItemImageSelected,
                                color: legendItemColorSelected
                            }
                        } else {
                            return l
                        }
                    })
                )

            } else {
                newObject = {
                    id: uuid(),
                    name: legendItemName,
                    start: legendItemIntervalStart,
                    end: legendItemIntervalEnd,
                    image: legendItemImageSelected,
                    color: legendItemColorSelected
                }

                if (legendItemList.map(l => l.name).includes(newObject.name) || legendItemList.map(l => l.end).includes(newObject.end))
                    throw new Error("Item already added")

                setLegendItemList([...legendItemList, newObject])
            }


            cleanStateAddItemLegend()
            setVisibleAddLegendItem(false)
        } catch (err) {
            setErrorMessageLegendItem(err.message)
            console.log(err)
        }
    }


    const handleDeleteLegend = async id => {
        try {
            if (id) {
                const newPayload = {
                    ...dataStoreReports,
                    legends: dataStoreReports.legends.filter(r => r.id !== id)
                }

                await handleSaveDataToDataStore(newPayload)
                setNotification({ visible: true, message: "Delete success", type: 'success' })
            } else {
                throw new Error("No report selected ")
            }

        } catch (err) {
            setNotification({ visible: true, message: err.message, type: 'critical' })
        }
    }


    const handleEditLegend = leg => {
        setEditLegend(true)
        setCurrentLegend(leg)
        initLegendState(leg)
        setVisibleNewLegendForm(true)
    }

    const initLegendState = (currLeg) => {
        if (currLeg) {
            setLegendDefaultNotApplicable(currLeg.notApplicable)
            setLegendDefaultMissingData(currLeg.missingData)
            setLegendDefaultType(currLeg.defaultType)
            setLegendItemList(currLeg.items)
            setLegendName(currLeg.name)
            setMin(currLeg.min)
            setMax(currLeg.max)
            setIntervalSpace(currLeg.intervalSpace)
        }
    }


    const handleChangeTypeLegend = ({ selected }) => {
        setLegendDefaultType(selected)
        setLegendDefaultMissingData(null)
        setLegendDefaultNotApplicable(null)
    }

    const handleSaveLegend = async () => {
        try {
            if (!legendDefaultNotApplicable || legendDefaultNotApplicable.trim() === "")
                throw new Error("Default Not applicable value is required")

            if (!legendDefaultMissingData || legendDefaultMissingData.trim() === "")
                throw new Error("Default Missing Data value is required")

            if (!legendName || legendName.trim() === "")
                throw new Error("Legend name is required")

            let payload = {}

            if (editLegend && currentLegend) {
                payload = {
                    ...dataStoreReports,
                    legends: dataStoreReports.legends.map(leg => {
                        if (leg.id === currentLegend.id) {
                            return {
                                ...leg,
                                name: legendName,
                                min,
                                max,
                                intervalSpace,
                                missingData: legendDefaultMissingData,
                                notApplicable: legendDefaultNotApplicable,
                                defaultType: legendDefaultType,
                                items: legendItemList,
                                updatedAt: moment()
                            }
                        } else {
                            return leg
                        }
                    })
                }
            } else {
                payload = {
                    ...dataStoreReports,
                    legends: [
                        ...dataStoreReports.legends,
                        {
                            id: uuid(),
                            name: legendName,
                            min,
                            max,
                            intervalSpace,
                            missingData: legendDefaultMissingData,
                            notApplicable: legendDefaultMissingData,
                            defaultType: legendDefaultType,
                            items: legendItemList,
                            createdAt: moment(),
                            updatedAt: moment()
                        }
                    ]
                }
            }

            await handleSaveDataToDataStore(payload)

            // Clean all state 
            cleanStateAddLegend()
            setVisibleNewLegendForm(false)
            setNotification({ message: "Legend saved", type: "success", visible: true })

        } catch (err) {
            console.log(err)
            setNotification({ message: err.message, type: "critical", visible: true })
        }
    }

    const handleCancelSaveLegend = () => {
        setVisibleNewLegendForm(false)
        cleanStateAddLegend()
    }

    const cleanStateAddLegend = () => {
        setLegendDefaultMissingData(null)
        setLegendDefaultNotApplicable(null)
        setLegendDefaultType(COLOR)
        setLegendName(null)
        setLegendItemList([])
        setCurrentLegend(null)
    }

    const RenderLegendTable = () => (
        <div className='bg-white p-4 rounded my-shadow border'>
            <div className='d-flex justify-content-between align-items-center mb-1'>
                <h4 style={{ textDecoration: "underline" }}> Legend list </h4>
                <Button primary onClick={handleNewLegendBtn}>+ New Legend</Button>
            </div>
            <Table>
                <TableHead>
                    <TableRowHead className="background-green-40">
                        <TableCellHead dense>Name</TableCellHead>
                        <TableCellHead dense>Missing Value</TableCellHead>
                        <TableCellHead dense>Not Applicable value</TableCellHead>
                        <TableCellHead dense>Last updated</TableCellHead>
                        <TableCellHead dense>Actions</TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    {dataStoreReports.legends.length > 0 ? dataStoreReports.legends.map(leg => (
                        <TableRow key={leg.id}>
                            <TableCell dense>
                                {leg.name}
                            </TableCell>

                            <TableCell dense>
                                {leg.defaultType === COLOR && leg.missingData && (
                                    <div className='d-flex align-items-center justify-content-center' style={{ backgroundColor: leg.missingData, width: "60px", height: "20px", borderRadius: "6px", fontWeight: "bold", color: '#FFF' }}> {leg.missingData} </div>
                                )}
                                {leg.defaultType === LABEL && leg.missingData && (
                                    <div> {leg.missingData} </div>
                                )}
                                {leg.defaultType === IMAGE && leg.missingData && (
                                    <img src={leg.missingData} style={{ height: "30px", width: "30px" }} />)}
                            </TableCell>
                            <TableCell dense>
                                {leg.defaultType === COLOR && leg.notApplicable && (
                                    <div className='d-flex align-items-center justify-content-center' style={{ backgroundColor: leg.notApplicable, width: "60px", height: "20px", borderRadius: "6px", fontWeight: "bold", color: '#FFF' }}> {leg.notApplicable} </div>
                                )}
                                {leg.defaultType === LABEL && leg.notApplicable && (
                                    <div> {leg.notApplicable} </div>
                                )}
                                {leg.defaultType === IMAGE && leg.notApplicable && (
                                    <img src={leg.notApplicable} style={{ height: "30px", width: "30px" }} />)}
                            </TableCell>
                            <TableCell dense>
                                {
                                    leg.updatedAt && (
                                        <div className='text-muted'> {moment(leg.updatedAt).format('DD/MM/YYYY')} </div>
                                    )
                                }

                            </TableCell>
                            <TableCell dense>
                                <div className='d-flex align-items-center'>
                                    <span>
                                        <BiEdit style={{ color: "#06695C", fontSize: "16px", cursor: "pointer" }} onClick={() => handleEditLegend(leg)} />
                                    </span>
                                    <span className='ml-2'>
                                        <RiDeleteBinLine style={{ color: "red", fontSize: "16px", cursor: "pointer" }} onClick={() => handleDeleteLegend(leg.id)} />
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell dense colSpan="6"> No Legend </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )



    const RenderAddItemModal = () => visibleAddLegendItem ? (
        <Modal onHidden={handleCancelAddItemLegend}>
            <ModalTitle> New Legend item </ModalTitle>
            <ModalContent>
                {errorMessageLegendItem && (<NoticeBox title="error" small dense error > {errorMessageLegendItem} </NoticeBox>)}
                <Scrollbars style={{ height: '400px', width: '100%' }}>
                    <div style={{ overflow: 'hidden' }} className='border rounded p-3'>
                        <div className='row'>
                            <div className='col-md'>
                                <Field label="Start value">
                                    <Input placeholder="Start value" type="number" value={legendItemIntervalStart} onChange={({ value }) => setLegendItemIntervalStart(value)} />
                                </Field>
                            </div>

                            <div className='col-md'>
                                <Field label="End value">
                                    <Input placeholder='End value' type="number" value={legendItemIntervalEnd} onChange={({ value }) => setLegendItemIntervalEnd(value)} />
                                </Field>
                            </div>
                        </div>
                        <div className='mt-3'>
                            <Field label='Item name'>
                                <Input placeholder="Item name" value={legendItemName} onChange={({ value }) => setLegendItemName(value)} />
                            </Field>
                        </div>

                        <div className='row mt-4 align-items-center'>
                            <div className='col-md-4'>Choose image: </div>
                            <div className='d-flex align-items-center col-md'>
                                {
                                    legendItemImageSelected && (
                                        <div>
                                            <img src={legendItemImageSelected} style={{ height: "30px", width: "30px" }} />
                                        </div>
                                    )
                                }
                                <div className='ml-2'>
                                    {/* {!visibleAddItemImageList && <Button icon={<RiImageAddFill style={{ fontSize: "16px" }} />} small onClick={() => setVisibleAddItemImageList(true)}> image</Button>} */}
                                    {
                                        !visibleAddItemImageList && (
                                            <input type='file' onChange={async file => {
                                                const current_file = file.target.files?.[0]
                                                if (current_file) {
                                                    const base64_url = await getFileAsBase64(current_file)
                                                    setLegendItemImageSelected(base64_url)
                                                }
                                            }}
                                                accept=".jpg, .jpeg, .png"
                                            />
                                        )
                                    }
                                    {/* {visibleAddItemImageList && <Button small onClick={() => setVisibleAddItemImageList(false)} destructive>Close</Button>} */}
                                </div>
                            </div>
                        </div>


                        <div className='row mt-4'>
                            <div className='col-md-4'>Color: </div>
                            <div className='col-md d-flex'>
                                <div>
                                    {
                                        legendItemColorSelected && <div className='d-flex align-items-center justify-content-center' style={{ width: "60px", height: "30px", color: "#FFF", fontWeight: "bold", backgroundColor: legendItemColorSelected, borderRadius: "6px" }}>
                                            {legendItemColorSelected}
                                        </div>
                                    }
                                </div>
                                <div className='ml-2'>
                                    <SketchPicker
                                        color={legendItemColorSelected || "#000000"}
                                        onChange={color => setLegendItemColorSelected(color.hex)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Scrollbars>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button small onClick={handleCancelAddItemLegend} destructive> Cancel </Button>
                    <Button small onClick={handleSaveAddLegendItem} primary> Save item</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    ) : <></>



    const RenderLegendItemList = () => (
        <div className='bg-white border rounded p-4 my-shadow mt-1'>
            <div className='d-flex justify-content-between my-1'>
                <h6 style={{ textDecoration: 'underline' }}> Legend Options List </h6>
                <Button className="bg-light" onClick={handleNewLegendItemBtn} small>+ New Item</Button>
            </div>
            <div>  <Table>
                <TableHead>
                    <TableRowHead className="bg-light">
                        <TableCellHead dense>Name</TableCellHead>
                        <TableCellHead dense>Interval</TableCellHead>
                        <TableCellHead dense>Color</TableCellHead>
                        <TableCellHead dense>Image</TableCellHead>
                        <TableCellHead dense>Actions</TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    {legendItemList.length > 0 ? legendItemList.map(leg => (
                        <TableRow key={leg.id}>
                            <TableCell dense>
                                {leg.name}
                            </TableCell>
                            <TableCell dense>
                                {"".concat(leg.start).concat(" <===> ").concat(leg.end)}
                            </TableCell>
                            <TableCell dense>
                                {leg.color && (
                                    <div className='d-flex align-items-center justify-content-center' style={{ width: "60px", height: "30px", color: "#FFF", fontWeight: "bold", backgroundColor: leg.color, borderRadius: "6px" }}> {leg.color} </div>
                                )}
                            </TableCell>
                            <TableCell dense>
                                {leg.image && (
                                    <img src={leg.image} style={{ height: "30px", width: "30px" }} />
                                )}
                            </TableCell>
                            <TableCell dense>
                                <div className='d-flex align-items-center'>
                                    <span>
                                        <BiEdit style={{ color: "#06695C", fontSize: "16px", cursor: "pointer" }} onClick={() => handleEditLegendItem(leg)} />
                                    </span>
                                    <span className='ml-2'>
                                        <RiDeleteBinLine style={{ color: "red", fontSize: "16px", cursor: "pointer" }} onClick={() => handleDeleteLegendItem(leg.id)} />
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell dense colSpan="6"> No Legend </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>
        </div>
    )


    const RenderLegendDefaultTypeLabel = () => (
        <>
            <div className='row'>
                <div className='col-md'>
                    <Field label="Default name if data missing:">
                        <Input placeholder="Missing data" value={legendDefaultMissingData} onChange={({ value }) => setLegendDefaultMissingData(value)} />
                    </Field>
                </div>
                <div className='col-md'>
                    <Field label="Default name if data is not applicable:">
                        <Input placeholder="Not applicable legend" value={legendDefaultNotApplicable} onChange={({ value }) => setLegendDefaultNotApplicable(value)} />
                    </Field>
                </div>
            </div>
        </>
    )


    const RenderLegendDefaultTypeImage = () => (
        <>
            <div className='row mt-3'>
                <div className='col-md'>
                    <div>
                        <div >Default image if data is missing </div>
                        <div>
                            <div className='d-flex align-items-center mt-1'>
                                {legendDefaultMissingData && (<div className='mr-2 mt-2'>
                                    <img src={legendDefaultMissingData} style={{ height: "30px", width: "30px" }} />
                                </div>
                                )}
                                <div className='d-flex align-items-center'>
                                    {/* {!visibleDefaultLegendImageMissingData &&
                                        (
                                            <div className='mr-2'>
                                                <Button icon={<RiImageAddFill style={{ fontSize: "16px" }} />} small onClick={() => setVisibleDefaultLegendImageMissingData(true)}>  image</Button>
                                            </div>
                                        )
                                    } */}
                                    {!visibleDefaultLegendImageMissingData &&
                                        (
                                            <input className='mt-2' type='file' onChange={async file => {
                                                const current_file = file.target.files?.[0]
                                                if (current_file) {
                                                    const base64_url = await getFileAsBase64(current_file)
                                                    setLegendDefaultMissingData(base64_url)
                                                }
                                            }}
                                                accept=".jpg, .jpeg, .png"
                                            />
                                        )
                                    }
                                    {visibleDefaultLegendImageMissingData && <Button small onClick={() => setVisibleDefaultLegendImageMissingData(false)} destructive>Close</Button>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-2' >
                        {visibleDefaultLegendImageMissingData && (
                            <div className='my-3'>
                                <div className='p-2 bg-light' style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "5px", flexWrap: "wrap" }}>
                                    {dataStoreReports.images.map(image => (
                                        <div style={{ cursor: "pointer", transition: "all 0.4s ease" }} className={'mr-2 image-item'.concat(visibleDefaultLegendImageMissingData === image.value ? " active" : "")} key={image.id} onClick={() => setLegendDefaultMissingData(image.value)}>
                                            <img src={image.value} style={{ height: "30px", width: "30px" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>)
                        }
                    </div>
                </div>

                <div className='col-md mt-4'>
                    <div>
                        <div>Default image if data is not applicable </div>
                        <div>
                            <div className='d-flex align-items-center mt-1'>
                                {
                                    legendDefaultNotApplicable && (
                                        <div className='mr-2 mt-2'>
                                            <img src={legendDefaultNotApplicable} style={{ height: "30px", width: "30px" }} />
                                        </div>
                                    )
                                }
                                <div className='d-flex align-items-center'>
                                    {/* {
                                        !visibleDefaultLegendImageNotApplicable && (
                                            <div className='mr-2'>
                                                <Button small onClick={() => setVisibleDefaultLegendImageNotApplicable(true)} icon={<RiImageAddFill style={{ fontSize: "16px" }} />}>  image</Button>
                                            </div>
                                        )
                                    } */}
                                    {
                                        !visibleDefaultLegendImageNotApplicable &&
                                        (
                                            <input className='mt-2' type='file' onChange={async file => {
                                                const current_file = file.target.files?.[0]
                                                if (current_file) {
                                                    const base64_url = await getFileAsBase64(current_file)
                                                    setLegendDefaultNotApplicable(base64_url)
                                                }
                                            }}
                                                accept=".jpg, .jpeg, .png"
                                            />
                                        )
                                    }
                                    {
                                        visibleDefaultLegendImageNotApplicable && (
                                            <Button small onClick={() => setVisibleDefaultLegendImageNotApplicable(false)} destructive>Close</Button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-2' >
                        {
                            visibleDefaultLegendImageNotApplicable && (
                                <div className='my-3'>
                                    <div className='p-2 bg-light' style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "5px", flexWrap: "wrap" }}>
                                        {dataStoreReports.images.map(image => (
                                            <div style={{ cursor: "pointer", transition: "all 0.4s ease" }} className={'mr-2 image-item'.concat(legendDefaultNotApplicable === image.value ? " active" : "")} key={image.id} onClick={() => setLegendDefaultNotApplicable(image.value)}>
                                                <img src={image.value} style={{ height: "30px", width: "30px" }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    )



    const RenderLegendDefaultTypeColor = () => (
        <>
            <div className='row mt-3'>
                <div className='col-md'>
                    <div >
                        <div >Default color if data is missing</div>
                        <div className='d-flex mt-1'>
                            {legendDefaultMissingData && <div className='mr-2'>
                                <div style={{ width: "60px", height: "30px", backgroundColor: legendDefaultMissingData, borderRadius: "5px" }}></div>
                            </div>}
                            <div >
                                <SketchPicker
                                    color={legendDefaultMissingData || "#000000"}
                                    onChange={color => setLegendDefaultMissingData(color.hex)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-md'>
                    <div>
                        <div>Default color if data is not applicable </div>
                        <div className='d-flex mt-1'>
                            {legendDefaultNotApplicable && <div className='mr-2'>
                                <div style={{ width: "60px", height: "30px", backgroundColor: legendDefaultNotApplicable, borderRadius: "5px" }}></div>
                            </div>}
                            <div>
                                <SketchPicker
                                    color={legendDefaultNotApplicable || "#000000"}
                                    onChange={color => setLegendDefaultNotApplicable(color.hex)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    const handleGenerateLegendOption = () => {
        setGenerateErrorMessage(null)

        if (!min)
            return setGenerateErrorMessage("The min value is required")

        if (!max)
            return setGenerateErrorMessage("The max value is required")

        if (!intervalSpace)
            return setGenerateErrorMessage('The interval is required')

        if (parseFloat(max) <= parseFloat(min))
            return setGenerateErrorMessage("The Max value must be gratter than min value")

        // if (parseFloat(intervalSpace) <= parseFloat(0) || parseFloat(intervalSpace) > parseFloat(max))
        //     return setGenerateErrorMessage("The Interval values must be valid and between min and max values ")

        if (!legendName || legendName?.length === 0)
            return setGenerateErrorMessage('The legend name is required')

        if (!legendDefaultMissingData)
            return setGenerateErrorMessage('The Default value when data is missing is required')

        if (!legendDefaultNotApplicable)
            return setGenerateErrorMessage('The Default value when data is not application is required')



        const pas = (parseFloat(max) - parseFloat(min)) / parseFloat(intervalSpace)

        const listOptions = []

        for (let i = parseFloat(min); i <= parseFloat(max); i = parseFloat(i) + parseFloat(pas)) {
            // if (Math.round(i) < Math.round(max)) {
            if (parseFloat(parseFloat(i).toFixed(4)) < parseFloat(parseFloat(max).toFixed(6))) {
                const start = i
                const end = parseFloat(i) + parseFloat(pas)

                const newObject = {
                    id: uuid(),
                    name: "Legend ".concat(parseFloat(i).toFixed(2)),
                    start: parseFloat(start).toFixed(2),
                    end: parseFloat(end).toFixed(2),
                    image: null,
                    color: null
                }

                listOptions.push(newObject)
            }
        }


        setLegendItemList(listOptions)

    }

    const RenderNewLegendGroupForm = () => (
        <div className='border rounded p-4 mt-2 my-shadow bg-white'>
            {
                generateErrorMessage && (
                    <NoticeBox error title="Legend Error Message">
                        {generateErrorMessage}
                    </NoticeBox>
                )
            }
            <div>
                <Field label="Legend name">
                    <Input placeholder="Legend name" value={legendName} onChange={({ value }) => setLegendName(value)} />
                </Field>
            </div>

            <div className='mt-2'>
                <div className='row'>
                    <div className='col'>
                        <Field label="Min value">
                            <Input
                                name="min"
                                onChange={({ value }) => setMin(value)}
                                value={min}
                                type="number"
                                placeholder="Min value"
                            />
                        </Field>
                    </div>
                    <div className='col'>
                        <div className='col'>
                            <Field label="Max value">
                                <Input
                                    name="max"
                                    onChange={({ value }) => setMax(value)}
                                    value={max}
                                    type="number"
                                    placeholder="Max value"
                                />
                            </Field>
                        </div>
                    </div>
                    <div className='col'>
                        <div className='col'>
                            <Field label="Interval value">
                                <SingleSelect
                                    placeholder="Interval value"
                                    onChange={({ selected }) => setIntervalSpace(selected)}
                                    selected={intervalSpace}>
                                    <SingleSelectOption label="3" value='3' />
                                    <SingleSelectOption label="4" value='4' />
                                    <SingleSelectOption label="5" value='5' />
                                    <SingleSelectOption label="6" value='6' />
                                    <SingleSelectOption label="7" value='7' />
                                    <SingleSelectOption label="8" value='8' />
                                    <SingleSelectOption label="9" value='9' />
                                </SingleSelect>
                            </Field>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-2'>
                <Field label="Legend Type">
                    <SingleSelect placeholder="Legend Type" onChange={handleChangeTypeLegend} selected={legendDefaultType}>
                        <SingleSelectOption label="Image" value={IMAGE} />
                        <SingleSelectOption label="Label" value={LABEL} />
                        <SingleSelectOption label="Color" value={COLOR} />
                    </SingleSelect>
                </Field>
            </div>
            <div className='mt-2'>
                {legendDefaultType === IMAGE && RenderLegendDefaultTypeImage()}
                {legendDefaultType === LABEL && RenderLegendDefaultTypeLabel()}
                {legendDefaultType === COLOR && RenderLegendDefaultTypeColor()}
            </div>

            <div className='mt-4'>
                <Button onClick={handleGenerateLegendOption} primary>Generate legend options</Button>
            </div>
        </div>
    )

    const RenderNewLegendForm = () => (
        <>
            <div className='d-flex align-items-center justify-content-between py-2'>
                <h5>New Legend</h5>
                <div className='d-flex'>
                    <Button destructive onClick={handleCancelSaveLegend}>Cancel</Button>
                    <Button className="ml-3" loading={loadingSendDatas || loadingDataStoreReports} primary onClick={handleSaveLegend}>{editLegend && currentLegend ? "Update Legend " : "Save Legend"}</Button>
                </div>
            </div>
            <hr />
            <div className='row'>
                <div className='col-md-5'>
                    {RenderNewLegendGroupForm()}
                </div>
                <div className='col-md-7'>
                    {RenderLegendItemList()}
                </div>
            </div>
        </>
    )

    return (
        <div className='mt-2'>
            {visibleNewLegendForm ? RenderNewLegendForm() : RenderLegendTable()}
            {RenderAddItemModal()}
        </div>
    )
}


export default LegendPage