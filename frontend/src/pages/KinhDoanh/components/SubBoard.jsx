import LeadCard from './LeadCard'

export default function SubBoard({ items, parentStage, columns, updateSubstage, addSubstageCard, removeLead, changeStage, setDetailLead }) {
  return (
    <div className="kd-board">
      {columns.map(([sub, label, color]) => {
        const cards = items.filter(lead => (lead.sub || columns[0][0]) === sub)
        return (
          <section
            className="stage-col"
            key={sub}
            onDragOver={event => event.preventDefault()}
            onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id) updateSubstage(id, sub) }}
          >
            <div className="kd-stage-stripe" style={{ background: color }} />
            <header className="stage-head"><strong style={{ color }}>{label}</strong><span>{cards.length}</span></header>
            <div className="stage-drop">
              {cards.map(lead => (
                <LeadCard key={lead.id} lead={lead} compact removeLead={removeLead} changeStage={changeStage} setDetailLead={setDetailLead} />
              ))}
            </div>
            <button className="kd-add-card" onClick={() => addSubstageCard(parentStage, sub)}>＋ Thêm thẻ</button>
          </section>
        )
      })}
    </div>
  )
}
