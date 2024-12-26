import { useContext } from "react";
import "./action-toolbar.css";
import { EngineContext } from "../../engine-context";
import { useUserId } from "../../hooks/use-user-id";
import { Action } from "./action";

export function ActionToolbar() {
  const state = useContext(EngineContext);
  const { userId } = useUserId();

  const currentUnit = state.units.find((unit) => unit.id === userId);

  const actions = currentUnit?.actions || [];

  return (
    <div className="action-toolbar">
      {actions.map((action) => (
        <Action key={action.name} action={action} />
      ))}
    </div>
  );
}
