import {
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis,
} from "recharts";
import { ConversationClustersList } from "@/types/kura";
import { useMemo } from "react";

type ClusterMapProps = {
  clusters: ConversationClustersList;
};

const ClusterMap = ({ clusters }: ClusterMapProps) => {
  const nodeCoordinates = clusters.map((cluster) => ({
    label: cluster.name,
    x: cluster.x_coord,
    y: cluster.y_coord,
    id: cluster.id,
  }));

  // Calculate bounds for scaling
  const { minX, maxX, minY, maxY, xRange, yRange } = useMemo(() => {
    const xValues = nodeCoordinates.map((node) => node.x);
    const yValues = nodeCoordinates.map((node) => node.y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return {
      minX,
      maxX,
      minY,
      maxY,
      xRange: maxX - minX,
      yRange: maxY - minY,
    };
  }, [nodeCoordinates]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 10,
            right: 10,
            bottom: 20,
            left: 20,
          }}
        >
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--accent))" }}
            content={({ payload }) => {
              if (payload && payload[0]) {
                return (
                  <div className="bg-card/95 backdrop-blur-sm p-3 border border-accent/20 rounded-lg shadow-lg text-xs max-w-56">
                    <div className="font-medium truncate text-foreground">
                      {payload[0].payload.label}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <XAxis
            type="number"
            dataKey="x"
            domain={[minX - xRange * 0.05, maxX + xRange * 0.05]}
            name="X"
            tickFormatter={(value) => value.toFixed(1)}
            fontSize={10}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[minY - yRange * 0.05, maxY + yRange * 0.05]}
            name="Y"
            tickFormatter={(value) => value.toFixed(1)}
            fontSize={10}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <ZAxis range={[30, 100]} />
          <Scatter
            name="Clusters"
            data={nodeCoordinates}
            fill="hsl(var(--chart-1))"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            cursor="pointer"
            opacity={0.8}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClusterMap;
