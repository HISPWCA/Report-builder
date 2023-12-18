import {
    Button,
    ButtonStrip,
    CircularLoader,
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
    TableRowHead,
} from '@dhis2/ui'
import { useState } from 'react'
import { SketchPicker } from 'react-color'
import Scrollbars from 'react-custom-scrollbars-2'
// import { RiImageAddFill } from 'react-icons/ri'
import { COLOR, IMAGE, LABEL, NOTIFICATON_CRITICAL, NOTIFICATON_SUCCESS } from '../utils/constants'
import { v4 as uuid } from 'uuid'
import { BiEdit } from 'react-icons/bi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { FiSave } from 'react-icons/fi'
import { DatePicker, Divider, Popconfirm, Popover, Table as TableAntd } from 'antd'
import { deleteKeyFromDataStore, getFileAsBase64, loadDataStore, saveDataToDataStore } from '../utils/fonctions'
import { FaRegClone } from 'react-icons/fa'
import { TiEdit } from 'react-icons/ti'
import dayjs from 'dayjs'
import { QuestionCircleOutlined } from '@ant-design/icons'


const LegendPage = ({
    setNotif,
    legends,
    loadingLegendContents,
    setLoadingLegends,
    setLegends,
    loadLegendContents
}) => {

    const [visibleSaveLegendPeriodPopup, setVisibleSaveLegendPeriodPopup] = useState(false)
    const [visibleAddItemImageList, setVisibleAddItemImageList] = useState(false)
    const [visibleNewLegendForm, setVisibleNewLegendForm] = useState(false)
    const [visibleAddLegendItem, setVisibleAddLegendItem] = useState(false)
    const [visibleDefaultLegendImageMissingData, setVisibleDefaultLegendImageMissingData] = useState(false)
    const [visibleDefaultLegendImageNotApplicable, setVisibleDefaultLegendImageNotApplicable] = useState(false)
    const [visibleFinishCreateLegend, setVisibleFinishCreateLegend] = useState(false)

    const [startDateForLegendSet, setStartDateForLegendSet] = useState(null)
    const [endDateForLegendSet, setEndDateForLegendSet] = useState(null)
    const [legendPeriods, setLegendPeriods] = useState([])
    const [currentLegendPeriod, setCurrentLegendPeriod] = useState(null)
    const [isLegendCloned, setIsLegendCloned] = useState(false)
    const [legendDefaultType, setLegendDefaultType] = useState(IMAGE)
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
    const [editLegendItem, setEditLegendItem] = useState(false)
    const [editLegend, setEditLegend] = useState(false)
    const [currentLegend, setCurrentLegend] = useState(null)
    const [currentLegendContent, setCurrentLegendContent] = useState(null)
    const [currentLegendItem, setCurrentLegendItem] = useState(null)
    const [min, setMin] = useState(null)
    const [max, setMax] = useState(null)
    const [intervalSpace, setIntervalSpace] = useState(3)
    const [generateErrorMessage, setGenerateErrorMessage] = useState(null)
    const [currentLegendIdToDelete, setCurrentLegendIdToDelete] = useState(null)

    const [loadingProcess, setLoadingProcess] = useState(false)
    const [loadingCurrentLegendContent, setLoadingCurrentLegendContent] = useState(false)

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
        }
    }


    const handleDeleteLegend = async id => {
        try {
            if (id) {
                setCurrentLegendIdToDelete(id)
                setLoadingProcess(true)
                const refreshLegendList = await loadDataStore(process.env.REACT_APP_LEGENDS_KEY, null, null, [])
                const newPayload = refreshLegendList.filter(r => r.id !== id)

                await saveDataToDataStore(process.env.REACT_APP_LEGENDS_KEY, newPayload, null)
                await deleteKeyFromDataStore(`LEGEND_${id}`)

                loadDataStore(process.env.REACT_APP_LEGENDS_KEY, setLoadingLegends, setLegends, [])

                setNotif({ show: true, message: 'Delete success', type: NOTIFICATON_SUCCESS })
                setLoadingProcess(false)
                setCurrentLegendIdToDelete(null)
            } else {
                throw new Error("No legend selected ")
            }

        } catch (err) {
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
            setLoadingProcess(false)
        }
    }


    const handleEditLegend = async leg => {
        try {
            setLoadingCurrentLegendContent(true)
            setEditLegend(true)
            setCurrentLegend(leg)
            setVisibleNewLegendForm(true)

            const legContent = await loadDataStore(`LEGEND_${leg.id}`, null, null, {})
            if (!legContent)
                throw new Error(leg.name + " Content not found !")

            setLegendPeriods(legContent.periods ?
                Object.entries(legContent.periods).map(([key, val]) => (
                    {
                        ...val,
                        name: key
                    }
                )) : [])
            setCurrentLegendContent(legContent)

            initLegendState(leg, legContent)
            setLoadingCurrentLegendContent(false)
        } catch (err) {
            setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
            setLoadingCurrentLegendContent(false)
        }
    }

    const initLegendState = (currLeg, currentLegContent) => {
        if (currLeg && currentLegContent) {
            setLegendDefaultNotApplicable(currentLegContent.notApplicable)
            setLegendDefaultMissingData(currentLegContent.missingData)
            setLegendDefaultType(currentLegContent.defaultType)
            setLegendItemList(currentLegContent.items || [])
            setLegendName(currentLegContent.name)
            setMin(currentLegContent.min)
            setMax(currentLegContent.max)
            setIntervalSpace(currentLegContent.intervalSpace)
        }
    }


    const handleChangeTypeLegend = ({ selected }) => {
        setLegendDefaultType(selected)
        setLegendDefaultMissingData(null)
        setLegendDefaultNotApplicable(null)
    }

    const handleSaveLegend = async () => {
        try {
            setLoadingProcess(true)

            if (!legendName || legendName?.length === 0)
                return setGenerateErrorMessage('The legend name is required')

            let payload = {}
            let payloadLegendContent = {}

            const refreshLegendList = await loadDataStore(process.env.REACT_APP_LEGENDS_KEY, null, null, [])

            if (editLegend && currentLegend && refreshLegendList) {

                payload = refreshLegendList.map(leg => leg.id === currentLegend.id ? ({ ...leg, name: legendName, updatedAt: dayjs() }) : leg)


                const refreshCurrentLegendContent = await loadDataStore(`LEGEND_${currentLegend.id}`, null, null, {})
                console.log("refreshCurrentLegendContent: ", refreshCurrentLegendContent)

                if (!refreshCurrentLegendContent)
                    throw new Error(currentLegend.name + " Content not found !")

                payloadLegendContent = {
                    ...refreshCurrentLegendContent,
                    name: legendName,
                    periods: legendPeriods.length > 0 ?
                        legendPeriods.reduce((prev, current) => {
                            prev[`${current.name}`] = { ...current }
                            return prev
                        }, {})
                        : null,
                    updatedAt: dayjs()
                }

            } else {
                if (refreshLegendList.map(l => l.name).includes(legendName))
                    throw new Error("Legend already exist !")

                const legendId = uuid()

                payload = [
                    {
                        id: legendId,
                        name: legendName,
                        createdAt: dayjs(),
                        updatedAt: dayjs(),
                    },
                    ...refreshLegendList
                ]

                payloadLegendContent = {
                    id: legendId,
                    name: legendName,
                    createdAt: dayjs(),
                    updatedAt: dayjs(),
                    periods: legendPeriods.length > 0 ?
                        legendPeriods.reduce((prev, current) => {
                            prev[`${current.name}`] = { ...current }
                            return prev
                        }, {})
                        : null
                }
            }
            await saveDataToDataStore(process.env.REACT_APP_LEGENDS_KEY, payload, null)
            await saveDataToDataStore(`LEGEND_${payloadLegendContent.id}`, payloadLegendContent, null, null, null, true)

            const legendList = await loadDataStore(process.env.REACT_APP_LEGENDS_KEY, setLoadingLegends, setLegends, [])
            loadLegendContents(legendList)

            // Clean all state 
            cleanStateAddLegend()
            setVisibleNewLegendForm(false)
            setCurrentLegend(null)
            setCurrentLegendItem(null)
            setCurrentLegendPeriod(null)
            setLegendItemList([])
            setLegendPeriods([])
            setVisibleFinishCreateLegend(false)
            setNotif({ show: true, message: "Legend saved !", type: NOTIFICATON_SUCCESS })
            setLoadingProcess(false)
        } catch (err) {
            setLoadingProcess(false)
            setVisibleFinishCreateLegend(false)
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
        }
    }

    const handleCancelSaveLegend = () => {
        setGenerateErrorMessage(null)
        setVisibleNewLegendForm(false)
        setCurrentLegendPeriod(null)
        setLegendPeriods([])
        cleanStateAddLegend()
    }

    const cleanStateAddLegend = () => {
        setLegendDefaultMissingData(null)
        setLegendDefaultNotApplicable(null)
        setLegendDefaultType(COLOR)
        setLegendName(null)
        setLegendItemList([])
        setCurrentLegend(null)
        setCurrentLegendContent(null)
    }

    const RenderLegendTable = () => (
        <>
            <div className='bg-white p-3 border-bottom' style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Legend List </div>
            </div>
            <div className='p-3'>
                <div className='bg-white p-2 rounded my-shadow'>
                    <div className='text-right'>
                        <Button primary onClick={handleNewLegendBtn}>+ New Legend</Button>
                    </div>

                    <div className='mt-1'>
                        {loadingLegendContents && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularLoader small />
                                <span style={{ marginLeft: '10px' }}>Loading...</span>
                            </div>
                        )}
                        <div style={{ marginTop: '20px' }}>
                            <Table>
                                <TableHead>
                                    <TableRowHead className="background-green-40">
                                        <TableCellHead dense>Name</TableCellHead>
                                        <TableCellHead dense>Last updated</TableCellHead>
                                        <TableCellHead dense>Actions</TableCellHead>
                                    </TableRowHead>
                                </TableHead>
                                <TableBody>
                                    {
                                        legends.length > 0 ? legends.map(leg => (
                                            <TableRow key={leg.id}>
                                                <TableCell dense>
                                                    {leg.name}
                                                </TableCell>

                                                <TableCell dense>
                                                    {
                                                        leg.updatedAt && (
                                                            <div className='text-muted'> {dayjs(leg.updatedAt).format('DD/MM/YYYY')} </div>
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell dense>
                                                    <div className='d-flex align-items-center'>
                                                        <span>
                                                            <BiEdit style={{ color: "#06695C", fontSize: "16px", cursor: "pointer" }} onClick={() => handleEditLegend(leg)} />
                                                        </span>
                                                        {loadingProcess && leg.id === currentLegendIdToDelete && <CircularLoader small className='ml-2' />}
                                                        <span className='ml-2'>
                                                            <Popconfirm
                                                                title="Delete legend"
                                                                description="Are you sure to delete this legend ?"
                                                                icon={
                                                                    <QuestionCircleOutlined
                                                                        style={{
                                                                            color: 'red',
                                                                        }}
                                                                    />
                                                                }
                                                                onConfirm={() => handleDeleteLegend(leg.id)}
                                                            >
                                                                <RiDeleteBinLine style={{ color: "red", fontSize: "16px", cursor: "pointer" }} />
                                                            </Popconfirm>
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
                </div>
            </div>
        </>
    )

    const handleCancelSaveLegendPeriodModal = () => {
        setStartDateForLegendSet(null)
        setEndDateForLegendSet(null)
        setGenerateErrorMessage(null)
        setVisibleSaveLegendPeriodPopup(false)
        setCurrentLegendPeriod(null)
        setLegendItemList([])
        setIsLegendCloned(false)
    }

    const getPeriodSetNameFromPeriod = (start, end) => {
        let name = ''
        if (start)
            name = dayjs(start).format('YYYY-MM-DD')

        if (end)
            name = `${name}_${dayjs(end).format('YYYY-MM-DD')}`

        return name
    }

    const getPeriodSetNameFromStringAsPeriodObject = (period_string) => {
        let payload = { start: null, end: null }

        if (period_string && period_string?.trim()?.length > 0) {
            const periods = period_string.split('_')
            if (periods[0])
                payload.start = dayjs(periods[0]).format('YYYY-MM-DD')

            if (periods[1])
                payload.end = dayjs(periods[1]).format('YYYY-MM-DD')
        }

        return payload
    }

    const getPeriodSetNameFromStringAsPeriodName = (period_string) => {
        let periodString = ''

        if (period_string && period_string?.trim()?.length > 0) {
            const periods = period_string.split('_') || []
            periodString = periods.join('  to  ')
        }

        return periodString
    }

    const validateDateIfThereIsNoEndDate = async (periodList, start, end) => {
        if (!end) {
            const periods = periodList.map(p => getPeriodSetNameFromStringAsPeriodObject(p))?.filter(p => currentLegendPeriod ? getPeriodSetNameFromPeriod(p.start, p.end) !== currentLegendPeriod.name && !p.end : !p.end) || []
            if (periods.length > 0)
                throw new Error('There are already a period set with no end date created. May be you can close the period set with no end date  before add this !')
            return true

        } else {
            return true
        }
    }

    const validateIfIsAValideDate = async (periodList, start, end) => {
        if (!end) {
            const periods = periodList
                .map(p => getPeriodSetNameFromStringAsPeriodObject(p))
                .filter(p => currentLegendPeriod ? getPeriodSetNameFromPeriod(p.start, p.end) !== currentLegendPeriod.name : true)
                .reduce((prev, current) => {
                    const period = current
                    if (
                        (dayjs(period.start).isSame(dayjs(start)) || dayjs(period.start).isBefore(dayjs(start)))
                    ) {
                        prev.push(current)
                    }
                    return prev
                }, [])

            if (periods.length > 0)
                throw new Error('There are already existing date range which cover your selected dates !')

            return true
        } else {
            const periods = periodList
                .map(p => getPeriodSetNameFromStringAsPeriodObject(p))
                .filter(p => currentLegendPeriod ? getPeriodSetNameFromPeriod(p.start, p.end) !== currentLegendPeriod.name : true)
                .reduce((prev, current) => {
                    const period = current
                    if (
                        (dayjs(period.start).isSame(dayjs(start)) || dayjs(period.start).isBefore(dayjs(start))) &&
                        ((period.end && dayjs(period.end).isSame(dayjs(end))) || (period.end && dayjs(period.end).isAfter(dayjs(end))))
                    ) {
                        prev.push(current)
                    }
                    return prev
                }, [])


            if (periods.length > 0)
                throw new Error('There are already existing date range which cover your selected dates !')

            return true
        }
    }

    const handleSaveLegendPeriod = async () => {
        try {
            await validateDateIfThereIsNoEndDate(legendPeriods.map(l => l.name), startDateForLegendSet, endDateForLegendSet)

            if (endDateForLegendSet && dayjs(startDateForLegendSet).isAfter(endDateForLegendSet))
                throw new Error("The End Date must be gratter than Start Date !")

            if (legendPeriods.map(l => l.name).includes(getPeriodSetNameFromPeriod(startDateForLegendSet, endDateForLegendSet)))
                throw new Error('This legend is already added !')

            let payload = {
                name: getPeriodSetNameFromPeriod(startDateForLegendSet, endDateForLegendSet),
                min: null,
                max: null,
                intervalSpace: null,
                notApplicable: null,
                defaultType: IMAGE,
                missingData: null,
                items: []
            }

            if (isLegendCloned) {
                payload = {
                    ...currentLegendPeriod,
                    name: getPeriodSetNameFromPeriod(startDateForLegendSet, endDateForLegendSet),
                }
            }

            setLegendPeriods(
                [payload, ...legendPeriods]
            )
            setStartDateForLegendSet(null)
            setEndDateForLegendSet(null)
            setVisibleSaveLegendPeriodPopup(false)
            setIsLegendCloned(false)
            setCurrentLegendPeriod(null)
            return setNotif({ show: true, message: isLegendCloned ? 'Legend Cloned !' : 'Legend added !', type: NOTIFICATON_SUCCESS })
        } catch (err) {
            setVisibleSaveLegendPeriodPopup(false)
            return setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
        }
    }

    const RenderAddLegendPeriodModal = () => visibleSaveLegendPeriodPopup && (
        <Modal onHidden={handleCancelSaveLegendPeriodModal} small dense>
            <ModalTitle> <div style={{ fontWeight: 'bold', fontSize: '15px' }}> {currentLegendPeriod && !isLegendCloned ? 'Update period ' : 'New period '} </div></ModalTitle>
            <ModalContent>
                <div className='border rounded p-3'>
                    <div>
                        <div style={{ fontSize: '14px' }}>Start Date ( <span style={{ color: 'red', marginLeft: '5px' }}> {` * `}</span> )</div>
                        <div style={{ marginTop: '5px' }}>
                            <DatePicker style={{ width: '100%' }} picker='date' value={startDateForLegendSet} onChange={value => setStartDateForLegendSet(value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '14px' }}>End Date ( optional )</div>
                        <div style={{ marginTop: '5px' }}>
                            <DatePicker style={{ width: '100%' }} picker='date' value={endDateForLegendSet} onChange={value => setEndDateForLegendSet(value)} />
                        </div>
                    </div>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button small onClick={() => currentLegendPeriod && !isLegendCloned ? handleCancelLegendPeriodModification() : handleCancelSaveLegendPeriodModal()} destructive> Cancel </Button>
                    <Button small primary onClick={() => currentLegendPeriod && !isLegendCloned ? handleSaveLegendPeriodModification() : handleSaveLegendPeriod()}>Save Period</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )

    const cancelFinishCreation = () => {
        // setVisibleNewLegendForm(false)
        // setCurrentLegend(null)
        // setCurrentLegendContent(null)
        // setCurrentLegendItem(null)
        // setCurrentLegendPeriod(null)
        // setLegendItemList(null)
        setVisibleFinishCreateLegend(false)
    }

    const RenderFinishLegendCreationModal = () => visibleFinishCreateLegend && (
        <Modal onHidden={cancelFinishCreation} small dense>
            <ModalTitle> <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Save legend </div></ModalTitle>
            <ModalContent>
                <div>
                    <Field label="Legend name">
                        <Input placeholder="Legend name" value={legendName} onChange={({ value }) => setLegendName(value)} />
                    </Field>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button small onClick={cancelFinishCreation} destructive> Cancel </Button>
                    <Button small loading={loadingProcess} disable={loadingProcess || !legendName} primary onClick={handleSaveLegend}>Save legend</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )

    const handleUploadFile = async (file, setState) => {
        try {
            const current_file = file.target.files?.[0]
            if (current_file) {
                if (parseInt(current_file.size) / 1024 > 100)
                    throw new Error('The file is too big. The file must not be gratter than 100Kb')
                const base64_url = await getFileAsBase64(current_file)
                setState && setState(base64_url)
            }
        } catch (err) {
            setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
        }
    }

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
                                            <input type='file' onChange={(file) => handleUploadFile(file, setLegendItemImageSelected)}
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
        <div className='bg-white border rounded p-3 my-shadow'>
            <div className='d-flex justify-content-between'>
                <div style={{ textDecoration: 'underline', fontWeight: 'bold' }}> Legend Options List  {currentLegendPeriod && <>  ( {getPeriodSetNameFromStringAsPeriodName(currentLegendPeriod.name)}  )  </>}</div>
                <Button className="bg-light" onClick={handleNewLegendItemBtn} small>+ New Item</Button>
            </div>
            <div className='mt-1'>
                <Table>
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
                                            <Popconfirm
                                                title="Delete period"
                                                description="Are you sure to delete this legend ?"
                                                icon={
                                                    <QuestionCircleOutlined
                                                        style={{
                                                            color: 'red',
                                                        }}
                                                    />
                                                }
                                                onConfirm={() => handleDeleteLegendItem(leg.id)}
                                            >
                                                <RiDeleteBinLine style={{ color: "red", fontSize: "16px", cursor: "pointer" }} />
                                            </Popconfirm>
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
                    <Field label="Default name if data missing">
                        <Input placeholder="Missing data" value={legendDefaultMissingData} onChange={({ value }) => setLegendDefaultMissingData(value)} />
                    </Field>
                </div>
                <div className='col-md'>
                    <Field label="Default name if data is not applicable">
                        <Input placeholder="Not applicable legend" value={legendDefaultNotApplicable} onChange={({ value }) => setLegendDefaultNotApplicable(value)} />
                    </Field>
                </div>
            </div>
        </>
    )


    const RenderLegendDefaultTypeImage = () => (
        <>
            <div className='row mt-3'>
                <div className='col-md-12'>
                    <div>
                        <div >Default image if data is missing </div>
                        <div>
                            <div className='d-flex align-items-center mt-1'>
                                {legendDefaultMissingData && (<div className='mr-2 mt-2'>
                                    <img src={legendDefaultMissingData} style={{ height: "30px", width: "30px" }} />
                                </div>
                                )}
                                <div className='d-flex align-items-center'>
                                    {!visibleDefaultLegendImageMissingData &&
                                        (
                                            <input className='mt-2' type='file' onChange={(file) => handleUploadFile(file, setLegendDefaultMissingData)}
                                                accept=".jpg, .jpeg, .png"
                                            />
                                        )
                                    }
                                    {visibleDefaultLegendImageMissingData && <Button small onClick={() => setVisibleDefaultLegendImageMissingData(false)} destructive>Close</Button>}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className='col-md-12 mt-4'>
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

                                    {
                                        !visibleDefaultLegendImageNotApplicable &&
                                        (
                                            <input className='mt-2' type='file' onChange={file => handleUploadFile(file, setLegendDefaultNotApplicable)}
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

    const handleSaveLegendPeriodModification = async () => {
        try {

            setGenerateErrorMessage(null)

            await validateDateIfThereIsNoEndDate(legendPeriods.map(l => l.name), startDateForLegendSet, endDateForLegendSet)

            // await validateIfIsAValideDate(legendPeriods.map(l => l.name), startDateForLegendSet, endDateForLegendSet)


            if (!currentLegendPeriod)
                throw new Error("Please select period")

            if (!min)
                throw new Error("The min value is required")

            if (!max)
                throw new Error("The max value is required")

            if (!intervalSpace)
                throw new Error('The interval is required')

            if (parseFloat(max) <= parseFloat(min))
                throw new Error("The Max value must be gratter than min value")

            if (!legendDefaultMissingData)
                throw new Error('The Default value when data is missing is required')

            if (!legendDefaultNotApplicable)
                throw new Error('The Default value when data is not application is required')

            if (legendItemList.length === 0)
                throw new Error('Please add some legend items !')

            const payload = {
                ...currentLegendPeriod,
                name: getPeriodSetNameFromPeriod(startDateForLegendSet, endDateForLegendSet),
                defaultType: legendDefaultType,
                missingData: legendDefaultMissingData,
                notApplicable: legendDefaultNotApplicable,
                items: legendItemList,
                intervalSpace: intervalSpace,
                max: max,
                min: min,
            }

            setLegendPeriods(legendPeriods.map(leg => leg.name === currentLegendPeriod.name ? payload : leg))
            setNotif({ show: true, message: `Period ${currentLegendPeriod.name} has been updated`, type: NOTIFICATON_SUCCESS })

            setCurrentLegendPeriod(null)
            setMin(null)
            setIntervalSpace(null)
            setMax(null)
            setLegendDefaultMissingData(null)
            setLegendDefaultNotApplicable(null)
            setLegendItemList([])
            setIsLegendCloned(false)
            setStartDateForLegendSet(null)
            setEndDateForLegendSet(null)
            setVisibleSaveLegendPeriodPopup(false)
            setStartDateForLegendSet(null)
            setEndDateForLegendSet(null)

        } catch (err) {
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
            return setGenerateErrorMessage(err.message)
        }
    }




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


    const handleCancelLegendPeriodModification = () => {
        setGenerateErrorMessage(null)
        setIsLegendCloned(false)
        setVisibleSaveLegendPeriodPopup(false)
    }

    const RenderNewLegendGroupForm = () => (
        <div className='border rounded p-3 my-shadow bg-white'>
            <div className='my-3' style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                Period  {currentLegendPeriod && <>  ( {getPeriodSetNameFromStringAsPeriodName(currentLegendPeriod.name)} )  </>}
            </div>

            {
                generateErrorMessage && (
                    <NoticeBox error title="Legend Error Message">
                        {generateErrorMessage}
                    </NoticeBox>
                )
            }
            <div className='row mt-2'>
                <div className='col-md-6'>
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
                <div className='col-md-6'>
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
                <div className='col-md-12 mt-2'>
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
                <div className='col-md-12 mt-3'>
                    <Button onClick={handleGenerateLegendOption} small primary>Generate legend options</Button>
                </div>

                <div className='col-md-12 mt-3'>
                    <Divider style={{ margin: '0px' }} />
                </div>
            </div>
            <div className='mt-3'>
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

            <div className='mt-4 d-flex'>
                <div>
                    <Button destructive onClick={handleCancelLegendPeriodModification}>Cancel</Button>
                </div>
                <div style={{ marginLeft: '5px' }}>
                    <Button
                        icon={<FiSave style={{ color: '#FFF', fontSize: '18px' }} />}
                        onClick={() => setVisibleSaveLegendPeriodPopup(true)}
                        primary
                    >Update modifications</Button>
                </div>
            </div>
        </div>
    )

    const handlClonePeriod = (value) => {
        setIsLegendCloned(true)
        setVisibleSaveLegendPeriodPopup(true)
        setCurrentLegendPeriod(value)
    }

    const handleEditLegendPeriod = (value) => {
        setCurrentLegendPeriod(value)
        setMin(value.min)
        setMax(value.max)
        setIntervalSpace(value.intervalSpace)
        setLegendDefaultMissingData(value.missingData)
        setLegendDefaultNotApplicable(value.notApplicable)
        setLegendDefaultType(value.defaultType)
        setLegendItemList(value.items)
        setStartDateForLegendSet(getPeriodSetNameFromStringAsPeriodObject(value.name)?.start && dayjs(getPeriodSetNameFromStringAsPeriodObject(value.name)?.start))
        setEndDateForLegendSet(getPeriodSetNameFromStringAsPeriodObject(value.name)?.end && dayjs(getPeriodSetNameFromStringAsPeriodObject(value.name)?.end))
    }

    const handleDeletelegendPeriod = (name) => {
        try {

            if (name) {
                setCurrentLegendPeriod(null)
                setMin(null)
                setMax(null)
                setIntervalSpace(null)
                setLegendDefaultMissingData(null)
                setLegendDefaultNotApplicable(null)
                setLegendItemList([])

                setLegendPeriods(legendPeriods.filter(el => el.name !== name))

                setNotif({ show: true, message: "Period deleted", type: NOTIFICATON_SUCCESS })
            }
        } catch (err) {
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
        }
    }

    const RenderPeriodLegendList = () => (
        <div className='col-md-3' style={{ position: 'sticky', top: '50px' }}>
            <div className='my-shadow bg-white p-3 rounded'>
                <div className="d-flex justify-content-between">
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Periods</div>
                    <Button primary small onClick={() => setVisibleSaveLegendPeriodPopup(true)}>+ Add</Button>
                </div>

                <div className='mt-2'>
                    {
                        legendPeriods.length === 0 && (<div>List's empty !</div>)
                    }
                    {
                        legendPeriods.length > 0 && (
                            <TableAntd
                                size='small'
                                bordered
                                style={{ width: '100%' }}
                                pagination={false}
                                dataSource={
                                    legendPeriods.sort((a, b) => {
                                        const aObject = getPeriodSetNameFromStringAsPeriodObject(a.name)
                                        const bObject = getPeriodSetNameFromStringAsPeriodObject(b.name)
                                        return dayjs(aObject.start).isBefore(bObject.start) ? 1 : -1
                                    })
                                        .map(l => ({ ...l, nom: l.name, item: l }))
                                }
                                columns={
                                    [
                                        { title: "Nom", dataIndex: 'nom', render: nom => (<div>{getPeriodSetNameFromStringAsPeriodName(nom)}</div>) },
                                        {
                                            title: 'Actions', dataIndex: 'item',
                                            width: '100px',
                                            render: value => (
                                                <div style={{ display: 'flex', alignItems: 'center' }}>

                                                    <div>
                                                        <Popover content="Edit" trigger="hover">
                                                            <TiEdit style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => handleEditLegendPeriod(value)} />
                                                        </Popover>
                                                    </div>
                                                    <div className='ml-2'>
                                                        <Popover content="Clone" trigger="hover">
                                                            <FaRegClone style={{ fontSize: '15px', cursor: 'pointer' }} onClick={() => handlClonePeriod(value)} />
                                                        </Popover>
                                                    </div>
                                                    <div className='ml-2'>
                                                        <Popover content="Delete" trigger="hover">
                                                            <Popconfirm
                                                                title="Delete period"
                                                                description="Are you sure to delete this period ?"
                                                                icon={
                                                                    <QuestionCircleOutlined
                                                                        style={{
                                                                            color: 'red',
                                                                        }}
                                                                    />
                                                                }
                                                                onConfirm={() => handleDeletelegendPeriod(value.name)}
                                                            >
                                                                <RiDeleteBinLine style={{ color: "red", fontSize: "18px", cursor: "pointer" }} />
                                                            </Popconfirm>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    ]
                                }
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )

    const RenderLegendPeriodElementContent = () => (
        <div className="col-md-9">
            <div className='row'>
                <div className='col-md-5'>
                    {RenderNewLegendGroupForm()}
                </div>
                <div className='col-md-7'>
                    {RenderLegendItemList()}
                </div>
            </div>
        </div>
    )

    const RenderNewLegendForm = () => (
        <>
            <div className='d-flex align-items-center justify-content-between p-2 bg-white' style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}> {currentLegend && editLegend ? `Update legend : ( ${currentLegend?.name} )` : "New Legend"} </div>
                <div className='d-flex'>
                    <Button destructive onClick={handleCancelSaveLegend}>Cancel</Button>
                    <Button
                        icon={<FiSave style={{ color: '#FFF', fontSize: '18px' }} />}
                        className="ml-3"
                        primary
                        onClick={() => setVisibleFinishCreateLegend(true)}
                    >{editLegend && currentLegend ? "Update Legend " : "Save All Legends"}</Button>
                </div>
            </div>
            <hr />
            <div className='row p-2'>
                {
                    editLegend && currentLegend && loadingCurrentLegendContent && <div className='col-md-12 d-flex my-2'> <CircularLoader small /> <span className='ml-2'>Loading...</span></div>
                }

                {editLegend && currentLegend && !loadingCurrentLegendContent && !currentLegendContent && <div className='col-md-12'><NoticeBox warning>{`${currentLegend?.name} Content not found !`}</NoticeBox></div>}
                {RenderPeriodLegendList()}
                {currentLegendPeriod && !isLegendCloned && RenderLegendPeriodElementContent()}
            </div>
        </>
    )

    return (
        <div className='mt-2'>
            {visibleNewLegendForm ? RenderNewLegendForm() : RenderLegendTable()}
            {RenderAddItemModal()}
            {RenderAddLegendPeriodModal()}
            {RenderFinishLegendCreationModal()}
        </div>
    )
}


export default LegendPage